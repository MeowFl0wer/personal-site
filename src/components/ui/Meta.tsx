import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A labelled fact: tiny mono label above, readable sans value below.
 * Used for BASED IN / CURRENTLY, project ROLE / YEAR / STACK, and the mono
 * figures under field notes.
 */
export function MetaItem({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="meta text-muted">{label}</span>
      <span className="text-small leading-snug">{children}</span>
    </div>
  );
}

/** A row of MetaItems on the shared grid. */
export function MetaRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4", className)}>{children}</dl>
  );
}

/** Small mono figure used in Life: `24 KM`, `↑ 1,200 M`. */
export function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="meta text-muted">{label}</span>
      <span className="font-mono text-small tabular-nums">{value}</span>
    </div>
  );
}
