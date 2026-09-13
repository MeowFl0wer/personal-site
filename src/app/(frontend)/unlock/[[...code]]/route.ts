import { NextResponse, type NextRequest } from "next/server";
import { redeem } from "@/lib/access";
import { ACCESS_COOKIE } from "@/lib/unlocked";

/**
 * Redeems an access code and sends the visitor back to the page.
 *
 * One handler for both ways in, because they are the same secret: the link in
 * the admin ends in `/unlock/<code>`, and the prompt on the page is a plain GET
 * form that arrives as `/unlock?code=…`. A form rather than a fetch on purpose
 * — this works with scripting turned off, like the rest of the site.
 *
 * A route handler rather than anything rendered: a cookie cannot be set while a
 * page renders, only from here, an action or middleware.
 *
 * This whole directory is moved aside for the static export. There is no server
 * there to check a code against, which is the same reason nothing private is
 * ever built into it.
 */

/**
 * Ten tries per address per ten minutes.
 *
 * The codes are ten characters from an alphabet of 31, so guessing was never
 * the likely attack — this is here so that a script cannot turn the endpoint
 * into a way to enumerate them, and so a stolen link cannot be brute-forced
 * into a neighbouring one. In memory, because it protects a single server and
 * losing the counters on restart costs nothing.
 */
const ATTEMPTS = new Map<string, { count: number; resetAt: number }>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 10;

const rateLimited = (key: string) => {
  const now = Date.now();
  const seen = ATTEMPTS.get(key);

  if (!seen || seen.resetAt < now) {
    ATTEMPTS.set(key, { count: 1, resetAt: now + WINDOW });
    return false;
  }

  seen.count += 1;
  if (ATTEMPTS.size > 5000) {
    for (const [k, v] of ATTEMPTS) if (v.resetAt < now) ATTEMPTS.delete(k);
  }
  return seen.count > LIMIT;
};

export async function GET(request: NextRequest, context: { params: Promise<{ code?: string[] }> }) {
  const { code: segments } = await context.params;
  const code = segments?.[0] ?? request.nextUrl.searchParams.get("code") ?? "";

  /* Only ever back to a path on this site: `next` arrives from a query string,
     and an open redirect is how a phishing page borrows someone's domain. */
  const requested = request.nextUrl.searchParams.get("next") ?? "/about";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/about";

  /* Giving it back. There has to be a way to stop being unlocked — to check
     what a visitor sees, or to hand the laptop to someone. Clearing the cookie
     is the whole of it: nothing else on the server remembers. */
  if (request.nextUrl.searchParams.get("lock") !== null) {
    const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
    response.cookies.set({ name: ACCESS_COOKIE, value: "", expires: new Date(0), path: "/" });
    return response;
  }

  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const back = (status: string) =>
    NextResponse.redirect(new URL(`${next}?access=${status}`, request.nextUrl.origin));

  if (rateLimited(address)) return back("throttled");

  const result = await redeem(code);
  if (!result.ok) return back(result.reason);

  const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
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
}
