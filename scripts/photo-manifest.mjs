/**
 * The one list of every image slot the site has: path, width, height.
 *
 * Shared so the placeholder generator and the photo importer cannot drift
 * apart — they have to produce the same filenames at the same sizes or half
 * the site falls back to a missing image.
 *
 * `content/` points at these paths, so adding a slot here is not enough on its
 * own; the content file has to reference it too.
 */

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

// The rest of the field notes. /life shows six large, twelve compact and the
// remainder behind Earlier posts, so there has to be enough of them to see the
// difference between those three treatments.
const noteShapes = [
  [1600, 1067], [1200, 1500], [2000, 1250], [1400, 1000], [1200, 1600], [1600, 1100],
  [1400, 1400], [2000, 1200], [1300, 1000], [1200, 1500], [1600, 1067], [1400, 1050],
  [1200, 1600], [1600, 1100], [1500, 1000], [1200, 1500],
];
noteShapes.forEach(([w, h], index) => {
  jobs.push([`life/note-${String(index + 1).padStart(2, "0")}.jpg`, w, h]);
});

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

// The portrait at the top of /about. 4:5 — the crop a real photograph of a
// person is most likely to arrive in.
jobs.push(["about/portrait.jpg", 1200, 1500]);

export { jobs, LANDSCAPE, PORTRAIT };
