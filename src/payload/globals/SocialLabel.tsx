"use client";

import { useRowLabel } from "@payloadcms/ui";

export function SocialLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; handle?: string; platform?: string }>();

  if (!data?.label) return <span>Link {(rowNumber ?? 0) + 1}</span>;

  return (
    <span>
      {data.label}
      {data.handle ? `  ·  ${data.handle}` : ""}
    </span>
  );
}
