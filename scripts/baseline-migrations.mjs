/**
 * Marks the initial migration as already applied, for a database that was
 * built by the development schema push rather than by running it.
 *
 *   npm run migrate:baseline
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Outside production the SQLite adapter pushes schema changes straight into the
 * file, and records the fact as a single row in `payload_migrations` — name
 * `dev`, batch `-1`. So a database that has been developed against has all 188
 * tables and no record of any migration ever running.
 *
 * Point `payload migrate` at it and it does the only thing it can: it sees no
 * applied migrations, offers to run the initial one, and warns that data loss
 * will occur — because that migration begins by creating tables that already
 * exist. Answering yes fails on the first `CREATE TABLE`. Answering no does
 * nothing. Neither is a way forward, and the database in question is the one
 * with the real content in it.
 *
 * The way forward is to write down what is already true: the schema this
 * migration describes is present, so the migration is applied. That is all this
 * does — it writes one row. It creates and alters nothing.
 *
 * ── What it checks first ────────────────────────────────────────────────────
 *
 * Writing "this migration has run" into a database where it has not is worse
 * than the problem, because the next migration will then be applied on top of a
 * schema that is not what it expects. So the tables the migration would create
 * are compared against the tables that exist, and anything missing stops it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS = path.join(root, "src", "migrations");

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  /* Nothing to load; the environment is expected to carry it. */
}

const uri = process.env.DATABASE_URI ?? "file:./data/site.db";
if (!uri.startsWith("file:")) {
  console.error(
    `DATABASE_URI is ${uri}.\n` +
      `This writes to a local SQLite file directly and cannot reach a remote\n` +
      `libSQL database. For one of those, run the same single INSERT by hand —\n` +
      `see the bottom of this file.`,
  );
  process.exit(1);
}

const file = path.resolve(root, uri.replace(/^file:/, ""));
const sql = (statement) => {
  const result = spawnSync("sqlite3", [file, statement], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`sqlite3 failed: ${(result.stderr || "").trim() || result.status}`);
  }
  return result.stdout.trim();
};

const fail = (...lines) => {
  console.error("\n" + lines.join("\n") + "\n");
  process.exit(1);
};

if (!fs.existsSync(file)) {
  fail(`No database at ${file}.`, `A database that does not exist wants \`npm run migrate\`, not this.`);
}

/* The migration to claim. There is exactly one initial migration; if that ever
   stops being true this has to be looked at rather than guessed. */
const migrations = fs
  .readdirSync(MIGRATIONS)
  .filter((name) => name.endsWith(".ts") && name !== "index.ts")
  .map((name) => name.replace(/\.ts$/, ""))
  .sort();

if (migrations.length !== 1) {
  fail(
    `Expected exactly one migration to baseline, found ${migrations.length}:`,
    ...migrations.map((name) => `  ${name}`),
    ``,
    `Baselining is a one-off for a database that predates migrations entirely.`,
    `With more than one, work out by hand which of them this database already has.`,
  );
}
const [initial] = migrations;

/* Already done, or already migrating properly. Either way, not this. */
const applied = sql(`select name || ' (batch ' || batch || ')' from payload_migrations where batch >= 0;`);
if (applied) {
  fail(
    `This database already has migrations recorded:`,
    ...applied.split("\n").map((line) => `  ${line}`),
    ``,
    `Nothing to baseline. Use \`npm run migrate\`.`,
  );
}

/* Every table the migration creates must already be here. */
const source = fs.readFileSync(path.join(MIGRATIONS, `${initial}.ts`), "utf8");
/* The SQL lives inside a JS template literal, so every backtick in it is
   escaped. Match either form rather than depending on that. */
const wanted = [...source.matchAll(/CREATE TABLE\s+\\?`([^`\\]+)\\?`/g)].map((m) => m[1]);
const present = new Set(sql(`select name from sqlite_master where type='table';`).split("\n"));
const missing = wanted.filter((table) => !present.has(table));

if (wanted.length === 0) fail(`Could not read any CREATE TABLE out of ${initial}.ts. Refusing to guess.`);

if (missing.length > 0) {
  fail(
    `This database is missing ${missing.length} of the ${wanted.length} tables that`,
    `${initial} creates, for example:`,
    ...missing.slice(0, 8).map((table) => `  ${table}`),
    ``,
    `So the migration has NOT effectively been applied, and recording it as`,
    `applied would leave the next one to run against a schema it does not expect.`,
    `Refusing. This database wants \`npm run migrate\` on a copy, and a look at why.`,
  );
}

/* Backed up before the write, because the whole point of this database is that
   it is the one with the real content in it. */
const backup = `${file}.before-baseline-${new Date().toISOString().replace(/[:.]/g, "-")}`;
fs.copyFileSync(file, backup);

const dev = sql(`select count(*) from payload_migrations where batch < 0;`);
sql(`delete from payload_migrations where batch < 0;`);
sql(`insert into payload_migrations (name, batch) values ('${initial}', 1);`);

console.log(`
Baselined ${path.relative(root, file)}

  checked      ${wanted.length} tables, all present
  backup       ${path.relative(root, backup)}
  removed      ${dev} development push row(s)
  recorded     ${initial} as batch 1

\`npm run migrate\` will now report nothing to do, and the next migration you
create will apply to this database normally.
`);

/* For a remote libSQL database, the equivalent is one statement:
     delete from payload_migrations where batch < 0;
     insert into payload_migrations (name, batch) values ('<the migration>', 1);
   Check the table list first, the same way this does. */
