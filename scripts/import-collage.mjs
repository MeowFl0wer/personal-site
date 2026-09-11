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

const SRC = process.argv[2];
if (!SRC) {
  console.error('Usage: npm run collage -- "<folder>"');
  process.exit(1);
}

const OUT = path.join(process.cwd(), "public", "placeholder", "collage");

/* Every cut-out ships, not just the sixteen the four starting arrangements
   use — the whole point of moving this into the CMS is being able to reach for
   one that is not on the page yet. Named by eye, because the originals arrive
   as `ChatGPT Image <timestamp> (n).png`; re-exporting the folder changes the
   timestamps and this table has to be redone. */
const NAMES = {
  "ChatGPT Image Sep 10, 2026, 11_49_31 AM (1).png": "pair-ridges",
  "ChatGPT Image Sep 10, 2026, 11_49_31 AM (2).png": "pair-hills",
  "ChatGPT Image Sep 10, 2026, 11_49_32 AM (3).png": "pair-yaks",
  "ChatGPT Image Sep 10, 2026, 11_58_46 AM (1).png": "card-ridges",
  "ChatGPT Image Sep 10, 2026, 11_58_46 AM (2).png": "card-hills",
  "ChatGPT Image Sep 10, 2026, 11_58_47 AM (3).png": "card-yaks",
  "ChatGPT Image Sep 10, 2026, 12_08_32 PM (1).png": "pair-reeds",
  "ChatGPT Image Sep 10, 2026, 12_08_33 PM (2).png": "card-reeds",
  "ChatGPT Image Sep 10, 2026, 12_12_31 PM (1).png": "pair-coast",
  "ChatGPT Image Sep 10, 2026, 12_12_31 PM (2).png": "card-coast",
  "ChatGPT Image Sep 10, 2026, 12_12_32 PM (3).png": "pair-open-sea",
  "ChatGPT Image Sep 10, 2026, 12_12_33 PM (4).png": "card-open-sea",
  "ChatGPT Image Sep 11, 2026, 06_14_34 PM.png": "sheet-into-the-mountains",
  "ChatGPT Image Sep 11, 2026, 06_17_12 PM (1).png": "figure-back",
  "ChatGPT Image Sep 11, 2026, 06_17_13 PM (2).png": "figure-side",
  "ChatGPT Image Sep 11, 2026, 06_17_14 PM (3).png": "figure-front",
  "ChatGPT Image Sep 11, 2026, 06_17_15 PM (4).png": "figure-blue",
  "ChatGPT Image Sep 11, 2026, 06_31_44 PM (1).png": "figure-puffer",
  "ChatGPT Image Sep 11, 2026, 06_31_44 PM (2).png": "figure-striped",
  "ChatGPT Image Sep 11, 2026, 06_31_45 PM (3).png": "figure-neon",
  "ChatGPT Image Sep 11, 2026, 06_31_46 PM (4).png": "figure-mirror",
  "ChatGPT Image Sep 11, 2026, 06_31_46 PM (5).png": "figure-mirror-peace",
  "ChatGPT Image Sep 11, 2026, 06_31_47 PM (6).png": "group-friends",
  "ChatGPT Image Sep 11, 2026, 07_02_36 PM (1).png": "hills-green",
  "ChatGPT Image Sep 11, 2026, 07_02_38 PM (2).png": "pine-tree",
  "ChatGPT Image Sep 11, 2026, 07_02_39 PM (3).png": "reeds-gold",
  "ChatGPT Image Sep 11, 2026, 07_02_40 PM (4).png": "sea-stacks",
  "ChatGPT Image Sep 11, 2026, 07_02_40 PM (5).png": "snow-peak",
  "ChatGPT Image Sep 11, 2026, 07_02_41 PM (6).png": "ridge-red",
  "ChatGPT Image Sep 11, 2026, 07_02_42 PM (7).png": "snow-summit",
  "ChatGPT Image Sep 11, 2026, 07_02_42 PM (8).png": "forest-autumn",
  "ChatGPT Image Sep 11, 2026, 07_02_43 PM (9).png": "pine-branch",
  "ChatGPT Image Sep 11, 2026, 07_02_44 PM (10).png": "sunset-figure",
};

/* A card is opaque and portrait; a cut-out has its own alpha and gets trimmed
   to its content before it is scaled. Deciding by name rather than by probing
   the pixels keeps the output stable. */
const isCard = (name) => name.startsWith("card-") || name.startsWith("pair-");

/* The card tops out at 21rem and a piece at about two thirds of that, so
   these carry a 2x screen and stop. They were three times too big on the
   first pass, which mattered once three arrangements had to be in the
   document at once for the slide.
   The originals are ~1.5 MB each and every one of them would otherwise ship. */
const CARD_WIDTH = 760;
const PIECE_BOX = 480;

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
        .resize(PIECE_BOX, PIECE_BOX, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 88, alphaQuality: 90 })
        .toFile(out);

  report.push([name, `${written.width}x${written.height}`, written.size]);
}

const total = report.reduce((sum, [, , size]) => sum + size, 0);
for (const [name, dims, size] of report) {
  console.log(`${name.padEnd(26)} ${dims.padEnd(11)} ${(size / 1024).toFixed(0)} kB`);
}
console.log(`\n${report.length} files, ${(total / 1024).toFixed(0)} kB total → public/placeholder/collage`);
