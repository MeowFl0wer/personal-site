import { NextResponse, type NextRequest } from "next/server";
import { redeem } from "@/lib/access";
import { ACCESS_COOKIE } from "@/lib/unlocked";

/**
 * Redeems an access code and sends the visitor back to the page.
 *
 * Two ways in, and they are the same secret — but they are no longer the same
 * HTTP method, because they do not have the same problem:
 *
 *   GET  /unlock/<code>   the link sent from the admin. A link is a URL; there
 *                         is nowhere else for the code to be, and the grant's
 *                         expiry is what limits the damage of it being kept.
 *   POST /unlock          the prompt on the page. Here the code is typed, so it
 *                         has no business ending up in browser history, in a
 *                         `Referer`, or in a reverse proxy's access log. It goes
 *                         in the body instead, and the 303 sends the browser
 *                         back to a clean URL.
 *
 * Both are plain forms — no fetch, no state — so this still works with
 * scripting turned off, like the rest of the site.
 *
 * A route handler rather than anything rendered: a cookie cannot be set while a
 * page renders, only from here, an action or middleware.
 *
 * This whole directory is moved aside for the static export. There is no server
 * there to check a code against, which is the same reason nothing private is
 * ever built into it.
 */

/**
 * Three wrong codes per address per minute.
 *
 * Only failures are counted, and a success clears the address — someone typing
 * a code that works is not spending anyone's budget.
 *
 * The address comes from `x-forwarded-for`, which a client can simply set: the
 * header is only trustworthy after a proxy has rewritten it, and this handler
 * cannot tell whether one did. So there is a second counter that no header can
 * move — a ceiling on failures across the whole server in the same minute. A
 * script rotating fake addresses runs into that one instead.
 *
 * The ceiling is set where no human reaches it. Someone mistyping the code they
 * were sent gets three tries a minute; sixty failures a minute across the whole
 * site is not a person, and the codes are ten characters from an alphabet of 31
 * besides, so this was never the wall keeping anyone out — it is here so the
 * endpoint cannot be turned into a way to enumerate grants.
 *
 * In memory, because it protects a single server and losing the counters on a
 * restart costs nothing.
 */
const WINDOW = 60 * 1000;
const PER_ADDRESS = 3;
const ACROSS_EVERYONE = 60;

type Window = { count: number; resetAt: number };

const FAILURES = new Map<string, Window>();
let everyone: Window = { count: 0, resetAt: 0 };

const bump = (window: Window | undefined, now: number): Window =>
  !window || window.resetAt < now
    ? { count: 1, resetAt: now + WINDOW }
    : { count: window.count + 1, resetAt: window.resetAt };

/** Has this address, or the server as a whole, already used up the minute? */
const exhausted = (address: string) => {
  const now = Date.now();
  const seen = FAILURES.get(address);
  if (seen && seen.resetAt >= now && seen.count >= PER_ADDRESS) return true;
  return everyone.resetAt >= now && everyone.count >= ACROSS_EVERYONE;
};

const recordFailure = (address: string) => {
  const now = Date.now();
  FAILURES.set(address, bump(FAILURES.get(address), now));
  everyone = bump(everyone.resetAt < now ? undefined : everyone, now);

  /* Swept here rather than on a timer: this only grows when codes are being
     refused, which is exactly when it is worth the walk. */
  if (FAILURES.size > 5000) {
    for (const [key, window] of FAILURES) if (window.resetAt < now) FAILURES.delete(key);
  }
};

const clearFailures = (address: string) => FAILURES.delete(address);

const addressOf = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

/**
 * Only ever back to a path on this site: `next` arrives from the request, and
 * an open redirect is how a phishing page borrows someone's domain.
 */
const safeNext = (requested: string | null) =>
  requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/about";

/** `/about` + `?access=expired`, without assuming `next` had no query of its own. */
const backTo = (request: NextRequest, next: string, status?: string) => {
  const url = new URL(next, request.nextUrl.origin);
  if (status) url.searchParams.set("access", status);
  // 303: whatever the method was, the browser follows it with a GET.
  return NextResponse.redirect(url, 303);
};

/** Shared by both methods once the code and the destination are in hand. */
const unlock = async (request: NextRequest, rawCode: string, next: string) => {
  const address = addressOf(request);
  if (exhausted(address)) return backTo(request, next, "throttled");

  /* A code is ten characters. Anything longer is not a typo, and there is no
     reason to hand it to the database. */
  const result = await redeem(rawCode.slice(0, 64));

  if (!result.ok) {
    recordFailure(address);
    return backTo(request, next, result.reason);
  }

  clearFailures(address);

  const response = backTo(request, next);
  response.cookies.set({
    name: result.cookie.name,
    value: result.cookie.value,
    expires: result.cookie.expires,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
};

/** The link from the admin, and the way back out. */
export async function GET(request: NextRequest, context: { params: Promise<{ code?: string[] }> }) {
  const { code: segments } = await context.params;
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  /* Giving it back. There has to be a way to stop being unlocked — to check
     what a visitor sees, or to hand the laptop to someone. Clearing the cookie
     is the whole of it: nothing else on the server remembers. */
  if (request.nextUrl.searchParams.get("lock") !== null) {
    const response = backTo(request, next);
    response.cookies.set({ name: ACCESS_COOKIE, value: "", expires: new Date(0), path: "/" });
    return response;
  }

  /* `?code=` is still read so that a link written by hand, or one sent before
     the form started posting, still lands. */
  const code = segments?.[0] ?? request.nextUrl.searchParams.get("code") ?? "";
  return unlock(request, code, next);
}

/** The prompt on the page, where the code is typed rather than followed. */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const next = safeNext(
    typeof form?.get("next") === "string" ? (form.get("next") as string) : null,
  );
  const code = typeof form?.get("code") === "string" ? (form.get("code") as string) : "";
  return unlock(request, code, next);
}
