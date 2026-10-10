/**
 * Production entry for the real site — not used by the GitHub Pages preview,
 * and not by `npm run dev`.
 *
 * It does what `next start` does, through Next's documented custom-server API
 * (node_modules/next/dist/docs/01-app/02-guides/custom-server.md), with one
 * difference: it listens on a Unix socket instead of a TCP port. That lets the
 * container run with no network at all — nothing to bind, nothing to reach out
 * to — while the reverse proxy reaches it through a bind-mounted directory that
 * only it and the container can enter.
 *
 * Nothing under `src/` knows about this file. Locally, `npm run dev` and
 * `npm start` behave exactly as before.
 */
import { createServer } from "node:http";
import { chmodSync, existsSync, lstatSync, unlinkSync } from "node:fs";
import next from "next";

const socketPath = process.env.SOCKET_PATH;
if (!socketPath) {
  console.error("SOCKET_PATH is not set; refusing to start.");
  process.exit(1);
}
// The kernel silently truncates a longer path (108 bytes on Linux, 104 on
// macOS) and the socket appears somewhere other than where the proxy looks.
if (Buffer.byteLength(socketPath) > 100) {
  console.error(`SOCKET_PATH is ${Buffer.byteLength(socketPath)} bytes; keep it under 100.`);
  process.exit(1);
}

const app = next({ dev: false, dir: process.cwd() });
const handle = app.getRequestHandler();
await app.prepare();

// A socket left behind by a previous run makes listen() fail with EADDRINUSE.
// Only ever remove a socket — never a regular file someone put at that path.
if (existsSync(socketPath)) {
  if (!lstatSync(socketPath).isSocket()) {
    console.error(`${socketPath} exists and is not a socket; refusing to remove it.`);
    process.exit(1);
  }
  unlinkSync(socketPath);
}

const server = createServer((req, res) => {
  Promise.resolve(handle(req, res)).catch((err) => {
    console.error(err);
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  });
});

server.listen(socketPath, () => {
  // Owner and group only. The directory around it is what actually keeps other
  // local users out; this is the second lock.
  chmodSync(socketPath, 0o660);
  console.log(`> Ready on unix:${socketPath}`);
});

const shutdown = (signal) => {
  console.log(`> ${signal}: closing`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
