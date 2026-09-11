/**
 * Prepares the home-page collage artwork.
 *
 *   npm run collage -- "/path/to/the/cut-out folder"
 *
 * Writes into src/assets/collage as WebP. They go under src/ rather than
 * public/ on purpose: a static import becomes a `/_next/static/media/…` URL,
 * which `assetPrefix` already covers, so the artwork survives being served
 * from a project path on GitHub Pages without one line of src/ knowing that
 * such a thing as a base path exists. A bare `/public` reference would not —
 * Next does not prefix those.
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

const OUT = path.join(process.cwd(), "src", "assets", "collage");

/* A card is the illustrated postcard the other pieces sit on: opaque, cream,
   4:5. A piece is a cut-out with its own alpha. */
const THEMES = {
  ridge: {
    card: "ChatGPT Image Sep 10, 2026, 11_58_46 AM (2).png",
    pieces: {
      hills: "ChatGPT Image Sep 11, 2026, 07_02_36 PM (1).png",
      figure: "ChatGPT Image Sep 11, 2026, 06_17_14 PM (3).png",
      pine: "ChatGPT Image Sep 11, 2026, 07_02_38 PM (2).png",
    },
  },
  plateau: {
    card: "ChatGPT Image Sep 10, 2026, 11_58_47 AM (3).png",
    pieces: {
      ridge: "ChatGPT Image Sep 11, 2026, 07_02_41 PM (6).png",
      figure: "ChatGPT Image Sep 11, 2026, 06_31_45 PM (3).png",
      branch: "ChatGPT Image Sep 11, 2026, 07_02_43 PM (9).png",
    },
  },
  coast: {
    card: "ChatGPT Image Sep 10, 2026, 12_12_31 PM (2).png",
    pieces: {
      stacks: "ChatGPT Image Sep 11, 2026, 07_02_40 PM (4).png",
      figure: "ChatGPT Image Sep 11, 2026, 06_31_44 PM (2).png",
      reeds: "ChatGPT Image Sep 11, 2026, 07_02_39 PM (3).png",
    },
  },
  snow: {
    card: "ChatGPT Image Sep 10, 2026, 11_58_46 AM (1).png",
    pieces: {
      summit: "ChatGPT Image Sep 11, 2026, 07_02_42 PM (7).png",
      figure: "ChatGPT Image Sep 11, 2026, 06_31_44 PM (1).png",
      peak: "ChatGPT Image Sep 11, 2026, 07_02_40 PM (5).png",
    },
  },
};

/* The card tops out at 21rem and a piece at about two thirds of that, so
   these carry a 2x screen and stop. They were three times too big on the
   first pass, which mattered once three arrangements had to be in the
   document at once for the slide.
   The originals are ~1.5 MB each and every one of them would otherwise ship. */
const CARD_WIDTH = 760;
const PIECE_BOX = 480;

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

const report = [];

for (const [theme, { card, pieces }] of Object.entries(THEMES)) {
  const cardOut = path.join(OUT, `${theme}-card.webp`);
  const info = await sharp(path.join(SRC, card))
    .resize(CARD_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(cardOut);
  report.push([`${theme}-card`, `${info.width}x${info.height}`, info.size]);

  for (const [name, file] of Object.entries(pieces)) {
    const out = path.join(OUT, `${theme}-${name}.webp`);
    /* Trim first: every cut-out arrives padded out to the generator's canvas,
       and without this the transparent margin becomes layout the CSS has to
       guess at. */
    const written = await sharp(path.join(SRC, file))
      .trim({ threshold: 10 })
      .resize(PIECE_BOX, PIECE_BOX, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 90 })
      .toFile(out);
    report.push([`${theme}-${name}`, `${written.width}x${written.height}`, written.size]);
  }
}

const total = report.reduce((sum, [, , size]) => sum + size, 0);
for (const [name, dims, size] of report) {
  console.log(`${name.padEnd(16)} ${dims.padEnd(11)} ${(size / 1024).toFixed(0)} kB`);
}
console.log(`\n${report.length} files, ${(total / 1024).toFixed(0)} kB total`);
