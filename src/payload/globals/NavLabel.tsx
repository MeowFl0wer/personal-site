"use client";

import { useRowLabel } from "@payloadcms/ui";

export function NavLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; route?: string; visible?: boolean }>();

  if (!data?.label) return <span>Item {(rowNumber ?? 0) + 1}</span>;

  return (
    <span>
      {data.label} — {data.route}
      {data.visible === false ? " · hidden" : ""}
    </span>
  );
}
