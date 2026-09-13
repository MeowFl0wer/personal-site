/**
 * The way back to being a visitor.
 *
 * Shown only to someone already holding a grant, and it is mostly for the
 * person who owns the site: the only way to see what the page actually looks
 * like to everyone else is to stop being unlocked. A plain link, because
 * clearing a cookie is a navigation and nothing here needs scripting.
 */
export function LockAgain({ next = "/about" }: { next?: string }) {
  return (
    <a
      href={`/unlock?lock=1&next=${encodeURIComponent(next)}`}
      data-print="hide"
      className="meta text-muted hover:text-ink transition-colors duration-[--duration-fast]"
    >
      Lock again
    </a>
  );
}
