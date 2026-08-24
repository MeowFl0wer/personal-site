/**
 * Shown only while draft mode is on, so it is never possible to be looking at
 * unpublished content and not know it.
 */
export function PreviewBanner() {
  return (
    <div className="sticky top-0 z-[60] bg-accent text-paper" data-print="hide">
      <div className="shell flex items-center justify-between gap-4 py-2">
        <p className="meta">Draft preview — this is not the published site</p>
        <a href="/next/exit-preview" className="meta link-underline">
          Exit preview
        </a>
      </div>
    </div>
  );
}
