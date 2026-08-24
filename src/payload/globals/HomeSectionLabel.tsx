"use client";

import { useRowLabel } from "@payloadcms/ui";

const LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  work: "Selected Work",
  life: "Life Preview",
  tools: "Tools Preview",
  elsewhere: "Resume / Contact",
};

/**
 * Row label for the home page's section list, so a collapsed row reads
 * "02 — Selected Work" rather than "Section 02". Small thing; it is the
 * difference between a reorder list you can scan and one you have to open.
 */
export function HomeSectionLabel() {
  const { data, rowNumber } = useRowLabel<{ block?: string; visible?: boolean; label?: string }>();

  const name = data?.label || LABELS[data?.block ?? ""] || "Section";
  const index = String((rowNumber ?? 0) + 1).padStart(2, "0");
  const hidden = data?.visible === false ? " · hidden" : "";

  return (
    <span>
      {index} — {name}
      {hidden}
    </span>
  );
}
