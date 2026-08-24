import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";

/**
 * `01 / WORK` — the one section label used site-wide.
 *
 * Mono, small, uppercase, wide tracking. It is the only place mono appears at
 * the top of a page, which is what makes it read as a system rather than a font
 * choice.
 *
 * THE NUMBERS FOLLOW THE NAVIGATION. They are a reader's sense of where they
 * are in the site, so a page numbered 03 must be the third thing in the nav —
 * otherwise the number is decoration that actively misinforms. Reorder the nav
 * in Site Settings and these have to move with it:
 *
 *   00    /about      preface; it is what the other sections are about
 *   01    /work
 *   02    /tools
 *   03    /life
 *   03.1  /gallery        both belong to Life, hence the decimal
 *   03.2  /life/archive
 *   04    /blog       the reserved Writing slot
 *   404   not-found
 *
 * The home page numbers itself separately and on purpose: `page.tsx` counts the
 * blocks the CMS has been dragged into, so home renumbers when its sections are
 * rearranged. That sequence indexes one page; this one indexes the site.
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
