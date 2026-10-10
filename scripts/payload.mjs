/**
 * Payload's CLI, with the one thing it is missing: something keeping the
 * process alive while it starts.
 *
 * node_modules/payload/bin.js starts with `void start()` and loads its
 * TypeScript through tsx's off-thread loader. While the main thread waits on
 * that loader nothing holds the event loop open, and now and then Node decides
 * there is nothing left to do and exits 0 — no output, no migration run, no
 * error. Measured on 2026-10-10: 2 of 15 runs of `migrate:status` locally, and
 * often enough in CI to fail a job three retries deep.
 *
 * The timer below is that missing hold. It changes nothing else: Payload ends
 * every command with process.exit (0 on success, 1 on a known failure), and an
 * unhandled error still crashes the process non-zero. With it, 0 of 30 runs
 * exited silently.
 *
 * Every `npm run payload|migrate*` script goes through this file; call it
 * directly as `node scripts/payload.mjs <command>`.
 */
setInterval(() => {}, 1 << 30);
await import("../node_modules/payload/bin.js");
