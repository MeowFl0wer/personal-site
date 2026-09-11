/**
 * Fills every image slot in the site with real photographs.
 *
 *   npm run photos -- "/path/to/a/folder/of/photographs"
 *
 * Writes to /public/placeholder under the names the content files already
 * reference, so nothing downstream has to know whether it is looking at a
 * generated stand-in or the real thing. Re-runnable: point it at a new folder
 * and run it again to swap the whole site's photography in one pass.
 *
 * Two things it is careful about:
 *
 * - Orientation. A portrait slot gets a portrait photograph. Cropping a wide
 *   landscape down to 4:5 throws away the composition and usually the subject
 *   with it, so slots are matched to sources by shape first and only then by
 *   position in the list.
 * - Repeats. With fewer photographs than slots some have to appear twice. The
 *   second pass walks the same ordered pool rather than picking at random, so
 *   repeats land as far apart as the list allows, and a re-run with the same
 *   folder produces exactly the same assignment.
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import { jobs } from "./photo-manifest.mjs";

const run = promisify(execFile);

const OUT = path.join(process.cwd(), "public", "placeholder");
const SRC = process.argv[2];

if (!SRC) {
  console.error("Usage: npm run photos -- <folder of photographs>");
  process.exit(1);
}

/* HEIC from an iPhone Live Photo carries more internal references than
   libheif's default security limit allows, and sharp refuses it. sips is part
   of macOS and reads them without complaint, so anything sharp cannot open is
   transcoded once into a scratch directory first. */
const normalise = async (dir, file) => {
  const full = path.join(dir, file);
  try {
    await sharp(full).metadata();
    return full;
  } catch {
    const target = path.join(scratch, `${path.parse(file).name}.jpg`);
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "95", full, "--out", target]);
    return target;
  }
};

const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "photo-import-"));

const sources = (await fs.readdir(SRC))
  .filter((f) => /\.(jpe?g|png|heic|heif|tiff?)$/i.test(f))
  .sort();

if (!sources.length) {
  console.error(`No photographs found in ${SRC}`);
  process.exit(1);
}

console.log(`Reading ${sources.length} photographs…`);

const pool = [];
for (const file of sources) {
  const resolved = await normalise(SRC, file);
  const { width, height } = await sharp(resolved).metadata();
  pool.push({ file, resolved, width, height, ratio: width / height });
}

const shapeOf = (w, h) => (w / h > 1.15 ? "landscape" : w / h < 0.87 ? "portrait" : "square");

const byShape = { landscape: [], portrait: [], square: [] };
for (const item of pool) byShape[shapeOf(item.width, item.height)].push(item);

/* A square slot is served acceptably by anything; a portrait slot is not.
   Fall back along that gradient rather than failing. */
const FALLBACK = {
  portrait: ["portrait", "square", "landscape"],
  landscape: ["landscape", "square", "portrait"],
  square: ["square", "landscape", "portrait"],
};

const cursor = { landscape: 0, portrait: 0, square: 0 };

const pick = (want) => {
  for (const shape of FALLBACK[want]) {
    const bucket = byShape[shape];
    if (!bucket.length) continue;
    const item = bucket[cursor[shape] % bucket.length];
    cursor[shape] += 1;
    return item;
  }
  throw new Error("No usable photographs at all");
};

await fs.mkdir(OUT, { recursive: true });

const used = new Map();
let written = 0;

for (const [file, width, height] of jobs) {
  const want = shapeOf(width, height);
  const source = pick(want);
  used.set(source.file, (used.get(source.file) ?? 0) + 1);

  const target = path.join(OUT, file);
  await fs.mkdir(path.dirname(target), { recursive: true });

  await sharp(source.resolved)
    .rotate() // honour EXIF orientation before measuring anything
    .resize(width, height, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(target);

  written += 1;
}

await fs.rm(scratch, { recursive: true, force: true });

const repeats = [...used.values()].filter((n) => n > 1).length;
console.log(`Wrote ${written} images to public/placeholder`);
console.log(`${used.size} of ${pool.length} photographs used; ${repeats} appear more than once`);
