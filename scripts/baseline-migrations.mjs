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
 * `dev`, batch `-1`. So a database that has been developed against has all the
 * tables and no record of any migration ever running.
 *
 * Point `payload migrate` at it and it does the only thing it can: it sees
 * nothing applied, offers to run the initial migration, and warns that data
 * loss will occur — because that migration begins by creating tables that
 * already exist. Yes fails on the first CREATE TABLE. No does nothing. Neither
 * is a way forward, and the database in question is the one with the real
 * content in it.
 *
 * The way forward is to write down what is already true: the schema this
 * migration describes is present, so the migration is applied. That is all this
 * does — one DELETE and one INSERT. It creates and alters nothing.
 *
 * ── How it checks, and why it is done this way ──────────────────────────────
 *
 * Recording a migration as applied when it has not been is worse than the
 * problem it solves, because every later migration then runs against a schema
 * nobody verified.
 *
 * A first version compared table names, and that is not a check. A database
 * missing a column — `media.caption`, say — still has every table, and was
 * accepted. Names are the one thing a schema cannot be wrong about quietly.
 *
 * So the comparison is against a real database: the migration is run on an
 * empty file, and the result is what this one has to match. No SQL is parsed
 * and no schema is described twice — the reference is produced by the same code
 * path that a fresh deployment runs.
 *
 * The comparison is semantic rather than textual. A database built by
 * incremental dev pushes ends up with the same columns in a different physical
 * order, and that difference means nothing — so columns, foreign keys and
 * indexes are compared as sets, through SQLite's own introspection rather than
 * through the text of CREATE TABLE.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS = path.join(root, "src", "migrations");
const SEP = "\x1f";

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  /* Nothing to load; the environment is expected to carry it. */
}

const fail = (...lines) => {
  console.error("\n" + lines.join("\n") + "\n");
  process.exit(1);
};

const uri = process.env.DATABASE_URI ?? "file:./data/site.db";
if (!uri.startsWith("file:")) {
  fail(
    `DATABASE_URI is ${uri}.`,
    `This reads and writes a local SQLite file directly and cannot reach a`,
    `remote libSQL database. For one of those, do the same two statements by`,
    `hand — they are at the bottom of this file — after making the same checks.`,
  );
}

const file = path.resolve(root, uri.replace(/^file:/, ""));
if (!fs.existsSync(file)) {
  fail(`No database at ${file}.`, `A database that does not exist wants \`npm run migrate\`, not this.`);
}

/** One sqlite3 invocation. `statement` may contain several, and a transaction. */
const sqlite = (target, statement) => {
  const result = spawnSync("sqlite3", ["-separator", SEP, target, statement], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`sqlite3: ${(result.stderr || "").trim() || `exit ${result.status}`}`);
  }
  return result.stdout.trim();
};
const rows = (target, statement) =>
  sqlite(target, statement).split("\n").filter(Boolean).map((line) => line.split(SEP));

/* ── The migration to claim ─────────────────────────────────────────────── */

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
    `With more than one, work out by hand which of them this database has.`,
  );
}
const [initial] = migrations;

/* ── This must be a development-push database, and nothing else ─────────── */

const existing = rows(file, `select name, batch from payload_migrations order by id;`);
const isDevPush = existing.length === 1 && existing[0][0] === "dev" && existing[0][1] === "-1";

if (!isDevPush) {
  fail(
    existing.length === 0
      ? `This database has no migration rows at all — not even the development push marker.`
      : `Expected exactly one row in payload_migrations (dev / -1), found ${existing.length}:`,
    ...existing.map(([name, batch]) => `  ${name} (batch ${batch})`),
    ``,
    `Baselining is only for a database built by the development schema push,`,
    `which leaves exactly that one marker. Anything else is a database whose`,
    `history this cannot work out, and guessing at it is how the next migration`,
    `ends up running against a schema nobody checked.`,
  );
}

/* ── Build the reference, by running the migration for real ─────────────── */

const reference = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "baseline-")), "reference.db");
process.stdout.write(`Building a reference database from ${initial} … `);

const built = spawnSync("npx", ["payload", "migrate"], {
  cwd: root,
  encoding: "utf8",
  env: {
    ...process.env,
    DATABASE_URI: `file:${reference}`,
    NODE_ENV: "production",
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || "baseline-reference-only",
  },
});

if (built.status !== 0 || !fs.existsSync(reference)) {
  console.log("failed.");
  fail(
    `Could not run ${initial} against an empty database:`,
    (built.stderr || built.stdout || "").trim().split("\n").slice(-6).join("\n"),
    ``,
    `Without a reference there is nothing to compare against, so this stops here.`,
  );
}
console.log("done.");

/* ── Compare, semantically ──────────────────────────────────────────────── */

const tablesOf = (target) =>
  rows(target, `select name from sqlite_master where type='table' and name not like 'sqlite_%' order by name;`)
    .map(([name]) => name);

/** Columns as a set: name, type, not-null, default, primary key. */
const columnsOf = (target, table) =>
  new Set(
    rows(target, `pragma table_info('${table}');`).map(
      ([, name, type, notnull, dflt, pk]) => `${name} ${type} notnull=${notnull} default=${dflt ?? ""} pk=${pk}`,
    ),
  );

const foreignKeysOf = (target, table) =>
  new Set(
    rows(target, `pragma foreign_key_list('${table}');`).map(
      ([, , refTable, from, to, onUpdate, onDelete]) =>
        `${from} -> ${refTable}.${to} update=${onUpdate} delete=${onDelete}`,
    ),
  );

/**
 * Indexes as a set. An index SQLite created for a UNIQUE or PRIMARY KEY
 * constraint is named automatically and the number in that name depends on the
 * order the constraints were declared in — which is exactly the kind of
 * difference this is supposed to ignore. So those are compared by what they
 * do; the ones with real names are compared by name as well.
 */
const indexesOf = (target, table) =>
  new Set(
    rows(target, `pragma index_list('${table}');`).map(([, name, unique, origin]) => {
      const columns = rows(target, `pragma index_info('${name}');`)
        .map(([, , column]) => column)
        .join(",");
      const identity = name.startsWith("sqlite_autoindex_") ? "(auto)" : name;
      return `${identity} unique=${unique} origin=${origin} (${columns})`;
    }),
  );

const differences = [];
const here = tablesOf(file);
const there = tablesOf(reference);

for (const table of there) if (!here.includes(table)) differences.push(`missing table: ${table}`);
for (const table of here) if (!there.includes(table)) differences.push(`unexpected table: ${table}`);

for (const table of there.filter((name) => here.includes(name))) {
  for (const [what, mine, theirs] of [
    ["column", columnsOf(file, table), columnsOf(reference, table)],
    ["foreign key", foreignKeysOf(file, table), foreignKeysOf(reference, table)],
    ["index", indexesOf(file, table), indexesOf(reference, table)],
  ]) {
    for (const item of theirs) if (!mine.has(item)) differences.push(`${table}: missing ${what}  ${item}`);
    for (const item of mine) if (!theirs.has(item)) differences.push(`${table}: unexpected ${what}  ${item}`);
  }
}

fs.rmSync(path.dirname(reference), { recursive: true, force: true });

if (differences.length > 0) {
  fail(
    `This database does not match what ${initial} produces — ${differences.length} difference(s):`,
    ``,
    ...differences.slice(0, 20).map((line) => `  ${line}`),
    ...(differences.length > 20 ? [`  … and ${differences.length - 20} more`] : []),
    ``,
    `So the migration has NOT effectively been applied, and recording it as`,
    `applied would leave every later migration running against a schema nobody`,
    `verified. Refusing.`,
  );
}

/* ── Write it down, in one transaction ──────────────────────────────────── */

const backup = `${file}.before-baseline-${new Date().toISOString().replace(/[:.]/g, "-")}`;
fs.copyFileSync(file, backup);

/* One statement, one process, one transaction. Split across two sqlite3 runs
   this could fail between them and leave a database with no migration rows at
   all — which is neither where it started nor where it was going. */
sqlite(
  file,
  `BEGIN IMMEDIATE;
   DELETE FROM payload_migrations WHERE batch < 0;
   INSERT INTO payload_migrations (name, batch) VALUES ('${initial}', 1);
   COMMIT;`,
);

const [[name, batch]] = rows(file, `select name, batch from payload_migrations;`);
if (name !== initial || batch !== "1") {
  fail(`The write did not take: payload_migrations says ${name} / ${batch}.`, `The backup is at ${backup}.`);
}

console.log(`
Baselined ${path.relative(root, file)}

  compared     ${there.length} tables — columns, defaults, primary keys,
               foreign keys and indexes — against a database built by
               running ${initial} on an empty file
  backup       ${path.relative(root, backup)}
  recorded     ${initial} as batch 1, replacing the development push marker

\`npm run migrate\` will now report nothing to do, and the next migration you
create will apply to this database normally.
`);

/* For a remote libSQL database the write is the same two statements:
     BEGIN IMMEDIATE;
     DELETE FROM payload_migrations WHERE batch < 0;
     INSERT INTO payload_migrations (name, batch) VALUES ('<the migration>', 1);
     COMMIT;
   Make the same comparison first. Do not skip it because it is tedious. */
