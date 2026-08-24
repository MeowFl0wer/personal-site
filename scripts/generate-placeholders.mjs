/**
 * Generates the placeholder photography in /public/placeholder.
 *
 *   npm run placeholders
 *
 * These are stand-ins, not art: muted warm-grey compositions in the site's own
 * palette, so the layouts can be judged on structure rather than on how pretty
 * the sample photos are. Delete the folder and drop in real images with the same
 * filenames — nothing else needs to change.
 *
 * Uses sharp, which ships with Next.js, so there is no extra dependency.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "placeholder");

/* Deterministic PRNG so re-running produces byte-identical files. */
const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const rng = (seed) => {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
};

/* Palette: warm neutrals with a single cool and a single earth tone. */
const PALETTES = [
  ["#d9d6cd", "#a8a49a", "#6f6c64"],
  ["#cfcdc6", "#8f8d86", "#3f3e3a"],
  ["#e2ded4", "#b6ada0", "#7b7266"],
  ["#c9ccc9", "#8d9491", "#4c524f"],
  ["#ded6cb", "#c0a894", "#7a6553"],
  ["#c6c8cd", "#909399", "#4e5157"],
];

const svg = (name, width, height) => {
  const r = rng(hash(name));
  const palette = PALETTES[Math.floor(r() * PALETTES.length)];
  const [light, mid, dark] = palette;
  const angle = Math.floor(r() * 180);
  const horizon = 0.34 + r() * 0.36;

  // A horizon, a couple of soft masses, a hairline. Reads as landscape-ish at
  // any aspect ratio without pretending to be a real photograph.
  const bands = Array.from({ length: 3 }, (_, i) => {
    const y = height * (horizon + (i + 1) * 0.06 * (r() - 0.3));
    const h = height * (0.02 + r() * 0.05);
    const o = 0.06 + r() * 0.12;
    return `<rect x="0" y="${y.toFixed(1)}" width="${width}" height="${h.toFixed(1)}" fill="${dark}" opacity="${o.toFixed(2)}"/>`;
  }).join("");

  const massCount = 2 + Math.floor(r() * 2);
  const masses = Array.from({ length: massCount }, () => {
    const cx = r() * width;
    const cy = height * horizon + (r() - 0.5) * height * 0.3;
    const rx = width * (0.18 + r() * 0.3);
    const ry = height * (0.12 + r() * 0.26);
    return `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="${mid}" opacity="${(0.25 + r() * 0.3).toFixed(2)}"/>`;
  }).join("");

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
        <stop offset="0%" stop-color="${light}"/>
        <stop offset="55%" stop-color="${mid}"/>
        <stop offset="100%" stop-color="${dark}"/>
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="${(Math.min(width, height) * 0.045).toFixed(1)}"/></filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <g filter="url(#soft)">${masses}</g>
    ${bands}
    <rect x="0" y="${(height * horizon).toFixed(1)}" width="${width}" height="1" fill="${dark}" opacity="0.3"/>
  </svg>`);
};

/** Fine luminance noise, so the flat gradients do not band on a wide gamut display. */
const grain = (width, height) =>
  sharp({
    create: {
      width,
      height,
      channels: 3,
      noise: { type: "gaussian", mean: 128, sigma: 9 },
    },
  })
    .png()
    .toBuffer();

const write = async (file, width, height) => {
  const target = path.join(OUT, file);
  await fs.mkdir(path.dirname(target), { recursive: true });

  const base = sharp(svg(file, width, height));
  const noise = await grain(width, height);

  await base
    .composite([{ input: noise, blend: "soft-light" }])
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(target);

  return file;
};

/* ---------------------------------------------------------------- manifest */

const LANDSCAPE = [1600, 1067];
const PORTRAIT = [1067, 1600];

const jobs = [];

// Work: covers + three shots per case study.
for (const slug of ["project-alpha", "project-beta", "project-gamma", "project-delta"]) {
  jobs.push([`work/${slug}-cover.jpg`, 1600, 1000]);
  for (const n of [1, 2, 3]) jobs.push([`work/${slug}-0${n}.jpg`, 1400, 1000]);
}

// Life field notes.
jobs.push(["life/ridge-01.jpg", 2000, 1250]);
jobs.push(["life/ridge-02.jpg", 1200, 1500]);
jobs.push(["life/ridge-03.jpg", 1400, 1000]);
jobs.push(["life/japan-01.jpg", 1200, 1600]);
jobs.push(["life/japan-02.jpg", 1600, 1100]);
jobs.push(["life/japan-03.jpg", 1300, 1000]);
jobs.push(["life/coast-01.jpg", 2000, 1200]);
jobs.push(["life/film-01.jpg", 1400, 1400]);
jobs.push(["life/film-02.jpg", 1200, 1500]);

// Gallery — orientation must match content/gallery.ts.
const galleryOrientation = [
  "l", "p", "l", "p", "l", "l", "p", "l", "p", "l", "l", "p", "l", "l",
];
galleryOrientation.forEach((orientation, index) => {
  const id = `g-${String(index + 1).padStart(2, "0")}`;
  const [w, h] = orientation === "p" ? PORTRAIT : LANDSCAPE;
  jobs.push([`gallery/${id}.jpg`, w, h]);
});

// Tools + blog.
for (const id of ["tool-one", "tool-two", "tool-three"]) jobs.push([`tools/${id}.jpg`, 1400, 900]);
jobs.push(["blog/on-restraint.jpg", 1600, 900]);

const run = async () => {
  await fs.mkdir(OUT, { recursive: true });
  const written = await Promise.all(jobs.map(([file, w, h]) => write(file, w, h)));
  console.log(`Wrote ${written.length} placeholder images to public/placeholder`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
