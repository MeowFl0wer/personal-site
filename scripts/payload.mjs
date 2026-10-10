/**
 * Payload's CLI, run so that a stalled start-up is retried instead of passing
 * for success.
 *
 * node_modules/payload/bin.js runs `void start()` and registers tsx at runtime.
 * Now and then the TypeScript loading never settles; nothing is left holding
 * the event loop, and Node exits 0 having done nothing — no output, no
 * migration run (measured 2026-10-10: 2 of 15 runs locally; in CI often enough
 * to fail three retries in a row). Holding the loop open only turns that into
 * a hang (tried; CI hung for two hours).
 *
 * Here the CLI runs in a child — `node --import tsx` with the CLI awaited at
 * the top level — so a stall ends as exit 13 ("unsettled top-level await")
 * rather than 0. Measured: 4 of 30 child runs exited 13 with no output and the
 * rest succeeded. A 13 is a start-up that never reached the CLI, so it is
 * retried, up to five times; every other exit status is passed through as is.
 *
 * Every `npm run payload|migrate*|generate:*` script goes through this file;
 * call it directly as `node scripts/payload.mjs <command>`.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CHILD = "PAYLOAD_CLI_CHILD";
const ATTEMPTS = 5;

if (process.env[CHILD] === "1") {
  const { bin } = await import("../node_modules/payload/dist/bin/index.js");
  await bin();
} else {
  const args = ["--import", import.meta.resolve("tsx"), fileURLToPath(import.meta.url), ...process.argv.slice(2)];
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const result = spawnSync(process.execPath, args, {
      stdio: "inherit",
      env: { ...process.env, [CHILD]: "1" },
    });
    if (result.error) throw result.error;
    if (result.status !== 13) process.exit(result.status ?? 1);
    console.error(`(payload start-up stalled before running; attempt ${attempt} of ${ATTEMPTS})`);
  }
  process.exit(13);
}
