import { cn } from "@/lib/utils";
import type { Covered as Shape } from "@/lib/cms";

/**
 * Where something private would be: text, under frosted glass.
 *
 * The text is invented. That is the whole trick and it is worth being plain
 * about: blurring the real thing would mean the real thing is in the page, and
 * a blur is a picture of privacy rather than privacy — one developer console
 * away from being read. So the server sends a count and a rough line length
 * instead of content, and this draws words that were never anybody's.
 *
 * Two layers do the work. The words are blurred where they sit, which gives the
 * ragged edges and the varying density that make it read as writing rather than
 * as a loading skeleton. Over them is a pane: a backdrop blur, a wash of the
 * page's own paper, and one bright edge along the top, which is what a sheet of
 * glass does to the light and what stops the whole thing looking like a mistake.
 */

/* Word-shaped and deterministic. Deterministic because the same block has to
   come out the same on the server and in the browser, and because text that
   reshuffles on every visit draws the eye to itself. */
const LETTERS = "aecoinrstlmdupgbhyfvkw";

const words = (seed: number, characters: number) => {
  const out: string[] = [];
  let state = seed * 2654435761;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  let used = 0;
  while (used < characters) {
    const length = 2 + Math.floor(next() * 8);
    let word = "";
    for (let i = 0; i < length; i += 1) word += LETTERS[Math.floor(next() * LETTERS.length)];
    out.push(word);
    used += length + 1;
  }
  return out.join(" ");
};

export function Covered({
  shape,
  label,
  className,
  seed = 0,
}: {
  shape: Shape;
  /** Named for a screen reader, which otherwise meets a pane of nothing. */
  label: string;
  className?: string;
  /** Varies the invented words. Two blocks with the same one look copied,
      which is exactly what a reader notices and what gives the trick away. */
  seed?: number;
}) {
  const rows = Math.max(1, shape.rows);
  const lines = Math.max(1, shape.lines);

  return (
    <div
      className={cn("relative isolate select-none", className)}
      role="group"
      aria-label={`${label} — locked`}
    >
      <div className="flex flex-col gap-6" aria-hidden="true">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex flex-col gap-1.5">
            {/* One heavier line to open each entry, the way a real one has a
                name above its detail. */}
            <p
              className="text-small overflow-hidden font-medium text-ink/70 blur-[3.5px]"
              style={{ width: `${52 + ((seed * 13 + row * 37) % 30)}%` }}
            >
              {words(seed * 977 + row * 101 + 7, 22)}
            </p>
            {Array.from({ length: lines }, (_, line) => (
              <p
                key={line}
                className="text-small overflow-hidden text-ink/55 blur-[3.5px]"
                style={{ width: `${[96, 88, 93, 79, 91, 84][(seed + row + line) % 6]}%` }}
              >
                {words(seed * 977 + row * 211 + line * 17 + 3, 78)}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* The pane. `backdrop-blur` over an already blurred layer is not
          redundant — it is what puts the glass in front of the words rather
          than in the same plane as them. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-2 -inset-y-3 rounded-[3px] border border-paper/50 bg-paper/30 backdrop-blur-[2px] backdrop-saturate-150"
        style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.55)" }}
      />
    </div>
  );
}
