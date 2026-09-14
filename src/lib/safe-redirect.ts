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
