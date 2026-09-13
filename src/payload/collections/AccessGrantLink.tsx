"use client";

import { useFormFields } from "@payloadcms/ui";

/**
 * The link to send, built from the code beside it.
 *
 * Shown rather than stored: the site's address is deployment configuration and
 * has no business being copied into every row, where it would go stale the day
 * the domain changes.
 */
export function AccessGrantLink() {
  const code = useFormFields(([fields]) => fields.code?.value);

  if (!code) {
    return (
      <div className="field-type" style={{ marginBottom: "1.5rem" }}>
        <div className="field-label">Link</div>
        <p style={{ margin: 0, fontSize: ".8rem", opacity: 0.7 }}>
          Save once and the code — and this link — appear here.
        </p>
      </div>
    );
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <div className="field-type" style={{ marginBottom: "1.5rem" }}>
      <div className="field-label">Link</div>
      <input
        type="text"
        readOnly
        value={`${origin}/unlock/${String(code)}`}
        onFocus={(event) => event.currentTarget.select()}
        style={{ width: "100%", fontFamily: "var(--font-mono)" }}
      />
      <p style={{ margin: ".4rem 0 0", fontSize: ".8rem", opacity: 0.7 }}>
        Opening it unlocks the page for that browser until the grant expires. Anyone the link
        reaches can use it, so send it to one person and give the next person their own.
      </p>
    </div>
  );
}
