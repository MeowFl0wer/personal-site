/**
 * Prepares the home-page collage artwork.
 *
 *   npm run collage -- "/path/to/the/cut-out folder"
 *
 * Writes into public/placeholder/collage as WebP, which is where the seed
 * picks them up from. They become Media uploads like every other image on the
 * site, so the static export rewrites their URLs along with the rest and the
 * admin can reach for one that is not on the page yet.
 *
 * ── The source names ────────────────────────────────────────────────────────
 *
 * The originals arrive as `ChatGPT Image <timestamp> (n).png`, which says
 * nothing about what is in them, so the mapping below is by hand and by eye.
 * If the folder is ever re-exported the timestamps change and this table has to
 * be redone — there is no way around that short of renaming the sources, which
 * is the better fix if this happens twice.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NAMES, isCard } from "./collage-names.mjs";

const SRC = process.argv[2];
if (!SRC) {
  console.error('Usage: npm run collage -- "<folder>"');
  process.exit(1);
}

const OUT = path.join(process.cwd(), "public", "placeholder", "collage");


/* Both are capped by width, because width is what the page sets: a piece is
   drawn at a percentage of the card's width and its height follows. Capping
   the longest side instead — which this did at first — spends the whole budget
   on the height of a tall cut-out and leaves a standing figure 264 px wide
   where it needed 333.

   The card is drawn at most 21rem, 336 px. A cut-out can be drawn at anything
   up to 140% of that, and the arrangements currently reach 78%, which wants
   783 px on a 3x screen. 1100 covers that with room to enlarge, and most of
   the originals are already inside it — the cap only trims the few 1400 px
   ones, so what ships is the original for all but five of them.

   Quality 92 rather than 88 because the expensive pieces are pine needles and
   dry grass, and that is exactly where a webp encoder starts inventing mush.

   The real site's next/image re-encodes these per request, so the size is
   spent in the repository and on the static preview, not on a visitor. */
const CARD_WIDTH = 1200;
const PIECE_WIDTH = 1100;

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

const sources = (await fs.readdir(SRC)).filter((f) => /\.png$/i.test(f)).sort();
const report = [];

for (const file of sources) {
  const name = NAMES[file];
  if (!name) {
    console.warn(`skipped, not in the table: ${file}`);
    continue;
  }

  const out = path.join(OUT, `${name}.webp`);
  const pipeline = sharp(path.join(SRC, file));

  const written = isCard(name)
    ? await pipeline
        .resize(CARD_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 86 })
        .toFile(out)
    : await pipeline
        /* Trim first: every cut-out arrives padded out to the generator's
           canvas, and without this the transparent margin becomes layout the
           page has to guess at. */
        .trim({ threshold: 10 })
        .resize(PIECE_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 92, alphaQuality: 92 })
        .toFile(out);

  report.push([name, `${written.width}x${written.height}`, written.size]);
}

const total = report.reduce((sum, [, , size]) => sum + size, 0);
for (const [name, dims, size] of report) {
  console.log(`${name.padEnd(26)} ${dims.padEnd(11)} ${(size / 1024).toFixed(0)} kB`);
}
console.log(`\n${report.length} files, ${(total / 1024).toFixed(0)} kB total → public/placeholder/collage`);
