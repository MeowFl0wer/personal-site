"use client";

import { useRowLabel } from "@payloadcms/ui";

/** Makes a collapsed resume row read "Placeholder Studio — Senior Engineer". */
export function EntryLabel() {
  const { data, rowNumber } = useRowLabel<{
    organisation?: string;
    role?: string;
    start?: string;
    end?: string;
    current?: boolean;
  }>();

  if (!data?.organisation) return <span>Entry {(rowNumber ?? 0) + 1}</span>;

  const period = data.current
    ? `${data.start ?? ""} — Now`
    : [data.start, data.end].filter(Boolean).join(" — ");

  return (
    <span>
      {data.organisation}
      {data.role ? ` — ${data.role}` : ""}
      {period ? `  ·  ${period}` : ""}
    </span>
  );
}
