import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";

/**
 * `01 / WORK` — the one section label used site-wide.
 *
 * Mono, small, uppercase, wide tracking. It is the only place mono appears at
 * the top of a page, which is what makes it read as a system rather than a font
 * choice.
 */
export function SectionNumber({
  index,
  label,
  className,
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <p className={cn("meta text-muted", className)}>
      <span className="text-ink">{index}</span>
      <span className="mx-2 opacity-40">/</span>
      <span>{label}</span>
    </p>
  );
}

/**
 * Section label + optional large lead, sitting on the shared 12-column grid with
 * a hairline rule beneath. Every page opens with this so the baseline never
 * moves between routes.
 */
export function SectionHeader({
  index,
  label,
  lead,
  aside,
  className,
  rule = true,
}: {
  index: string;
  label: string;
  /** Large display lines. Each string is its own line. */
  lead?: string[];
  /** Optional right-hand column (a link, a count, a small note). */
  aside?: ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <header className={cn("w-full", className)}>
      <div className="grid-12 items-baseline gap-y-6">
        <Reveal className="col-span-4 md:col-span-6 lg:col-span-6">
          <SectionNumber index={index} label={label} />
        </Reveal>
        {aside ? (
          <Reveal
            className="col-span-4 md:col-span-6 lg:col-span-6 lg:justify-self-end"
            delay={0.06}
          >
            {aside}
          </Reveal>
        ) : null}
      </div>

      {rule ? <RuleReveal className="mt-4" /> : null}

      {lead && lead.length > 0 ? (
        <Reveal className="mt-10 md:mt-14" stagger="line">
          <h2 className="text-display max-w-[22ch] font-medium">
            {lead.map((line) => (
              <span key={line} data-reveal-item className="block">
                {line}
              </span>
            ))}
          </h2>
        </Reveal>
      ) : null}
    </header>
  );
}
