/**
 * Where a redirect is allowed to send someone.
 *
 * The unlock endpoint takes a `next` from the request and sends the visitor
 * there afterwards. That is an open redirect waiting to happen, and the first
 * attempt at closing it — "starts with `/`, does not start with `//`" — was
 * not enough. `/\evil.example` satisfies both, and the URL parser treats a
 * backslash as a slash for http(s), so it resolves to `http://evil.example/`
 * and the endpoint happily issued a 303 to it. Not a cookie leak; a way to
 * borrow this domain for a phishing hop, which is bad enough.
 *
 * String inspection is the wrong tool. Only the URL parser knows what a string
 * resolves to, so the string is resolved and its origin compared.
 *
 * The second half matters as much as the first: this returns the parsed URL,
 * not a path to be parsed again. `/..//evil.example` resolves to this origin
 * with a pathname of `//evil.example` — so a function that checked the origin
 * and then handed back `url.pathname` would reopen the hole the moment the
 * caller resolved that against an origin a second time. Verified; it does.
 * Nothing downstream ever sees a relative string again.
 */

/**
 * Resolves `requested` against `origin` and returns it only if it stayed
 * there. Anything else — another host, a scheme, an unparseable string —
 * becomes `fallback` on this origin.
 */
export const sameOriginTarget = (
  requested: string | null | undefined,
  origin: string,
  fallback = "/about",
): URL => {
  const home = new URL(fallback, origin);
  if (!requested) return home;

  try {
    const target = new URL(requested, origin);
    return target.origin === origin ? target : home;
  } catch {
    /* Not a URL at all, relative to this origin or otherwise. */
    return home;
  }
};

/**
 * This site's public origin — what a redirect has to be built on.
 *
 * Not `request.nextUrl.origin`. In production the app is served by server.mjs
 * on a Unix socket, and Next, with no host or port of its own, makes the
 * request's origin up: it came out as `https://localhost:3000`, and the unlock
 * endpoint sent every visitor there (found 2026-10-10 on the first request
 * through the real domain). Nor the `Host` header, which is whatever the
 * client sent.
 *
 * The configured site URL is the truth. The request's own origin is only the
 * fallback, for `npm run dev`, where nothing may be configured and it is right.
 */
export const siteOrigin = (
  requestOrigin: string,
  configured: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
): string => {
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      /* A malformed setting falls through rather than taking the site down. */
    }
  }
  return requestOrigin;
};
