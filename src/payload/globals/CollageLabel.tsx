"use client";

import { useRowLabel } from "@payloadcms/ui";

/** "01 · Ridge" rather than "Arrangement 01", which says nothing. */
export function CollageLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string }>();
  const index = String((rowNumber ?? 0) + 1).padStart(2, "0");
  return <span>{data?.label ? `${index} · ${data.label}` : `${index} · Untitled`}</span>;
}

/** A cut-out row collapses to nothing useful without its position. */
export function PieceLabel() {
  const { data, rowNumber } = useRowLabel<{ x?: number; y?: number; width?: number }>();
  const index = String((rowNumber ?? 0) + 1).padStart(2, "0");
  const at =
    data?.x === undefined || data?.y === undefined
      ? "unplaced"
      : `${Math.round(data.x)}% × ${Math.round(data.y)}%`;
  return (
    <span>
      {index} · {at}
      {data?.width ? ` · ${Math.round(data.width)}% wide` : ""}
    </span>
  );
}
