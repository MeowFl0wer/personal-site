/**
 * Marks migrations as already applied, for a database that was built by the
 * development schema push rather than by running them.
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
 * The way forward is to write down what is already true: the schema these
 * migrations describe is present, so they are applied. That is all this does —
 * one DELETE and an INSERT per migration. It creates and alters nothing.
 *
 * ── Which migrations ────────────────────────────────────────────────────────
 *
 * A development database has whatever schema the code had the last time it was
 * pushed, and that need not be the newest one: a database last pushed before a
 * dependency upgrade added a column has every migration up to the one that adds
 * it, and not that one. So this does not assume. It finds the longest run of
 * migrations, from the first, whose result this database matches exactly — and
 * records that run, and nothing past it. `npm run migrate` then applies the
 * rest through the same code path a fresh deployment uses.
 *
 * Shorter runs are reached by rolling the reference back one migration at a
 * time with its own `down`. A `down` that is wrong produces a reference nothing
 * matches, so the failure is a refusal, never a false acceptance.
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
 * So the comparison is against a real database: the migrations are run on an
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

/* ── The migrations there are to claim ──────────────────────────────────── */

const migrations = fs
  .readdirSync(MIGRATIONS)
  .filter((name) => name.endsWith(".ts") && name !== "index.ts")
  .map((name) => name.replace(/\.ts$/, ""))
  .sort();

if (migrations.length === 0) {
  fail(`No migrations in ${path.relative(root, MIGRATIONS)} — there is nothing to baseline against.`);
}
for (const name of migrations) {
  if (!/^[0-9]{8}_[0-9]{6}_[a-z0-9_]+$/.test(name)) {
    fail(`Unexpected migration file name: ${name}`, `Names are written into SQL below, so only Payload's own pattern is accepted.`);
  }
}

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

/* ── Build the reference, by running the migrations for real ────────────── */

const referenceDir = fs.mkdtempSync(path.join(os.tmpdir(), "baseline-"));
const reference = path.join(referenceDir, "reference.db");

/**
 * `payload <args>` against the reference, as a production deployment runs it.
 *
 * Runs through scripts/payload.mjs, which holds the event loop open while
 * Payload's CLI starts; without it the CLI now and then exits 0 having done
 * nothing at all, not a line of output (see that file).
 *
 * The exit status alone is still not trusted: each call names what it was
 * supposed to achieve, and a silent exit 0 that did not achieve it is retried,
 * twice at most. A non-zero exit is a real failure and is never retried.
 */
const payloadOnReference = (achieved, ...args) => {
  let result;
  for (let attempt = 1; attempt <= 3; attempt++) {
    result = spawnOnce(...args);
    if (result.status !== 0 || achieved()) return result;
    if ((result.stdout || "").trim() || (result.stderr || "").trim()) return result;
    process.stdout.write(`(payload ${args.join(" ")} exited 0 without output or effect; retrying) `);
  }
  return result;
};

const spawnOnce = (...args) =>
  spawnSync(process.execPath, [path.join(root, "scripts", "payload.mjs"), ...args], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      DATABASE_URI: `file:${reference}`,
      NODE_ENV: "production",
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || "baseline-reference-only",
    },
  });

const giveUp = (what, result) => {
  console.log("failed.");
  fs.rmSync(referenceDir, { recursive: true, force: true });
  fail(
    `Could not ${what} (exit ${result.status}${result.signal ? `, signal ${result.signal}` : ""}):`,
    (result.stderr || result.stdout || "").trim().split("\n").slice(-6).join("\n") || "(no output)",
    ``,
    `Without a reference there is nothing to compare against, so this stops here.`,
  );
};

process.stdout.write(`Building a reference database from ${migrations.length} migration(s) … `);
const built = payloadOnReference(() => fs.existsSync(reference), "migrate");
if (built.status !== 0 || !fs.existsSync(reference)) giveUp(`run the migrations against an empty database`, built);

const applied = rows(reference, `select name from payload_migrations order by name;`).map(([name]) => name);
if (applied.join("\n") !== migrations.join("\n")) {
  giveUp(`account for the reference: it recorded ${applied.length} of ${migrations.length} migrations`, built);
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

const differencesFrom = (ref) => {
  const differences = [];
  const here = tablesOf(file);
  const there = tablesOf(ref);

  for (const table of there) if (!here.includes(table)) differences.push(`missing table: ${table}`);
  for (const table of here) if (!there.includes(table)) differences.push(`unexpected table: ${table}`);

  for (const table of there.filter((name) => here.includes(name))) {
    for (const [what, mine, theirs] of [
      ["column", columnsOf(file, table), columnsOf(ref, table)],
      ["foreign key", foreignKeysOf(file, table), foreignKeysOf(ref, table)],
      ["index", indexesOf(file, table), indexesOf(ref, table)],
    ]) {
      for (const item of theirs) if (!mine.has(item)) differences.push(`${table}: missing ${what}  ${item}`);
      for (const item of mine) if (!theirs.has(item)) differences.push(`${table}: unexpected ${what}  ${item}`);
    }
  }
  return { differences, tables: there.length };
};

/* ── Find the longest run of migrations this database matches ───────────── */

/* Newest first. Each step back undoes exactly one migration: it is moved into a
   batch of its own, and `migrate:down` rolls back only the latest batch. */
let matched = 0;
let compared = 0;
let closest = null;

for (let count = migrations.length; count >= 1; count--) {
  const { differences, tables } = differencesFrom(reference);
  if (differences.length === 0) {
    matched = count;
    compared = tables;
    break;
  }
  if (!closest || differences.length < closest.differences.length) closest = { count, differences };
  if (count === 1) break;

  const last = migrations[count - 1];
  process.stdout.write(`Not ${last}; rolling the reference back one migration … `);
  sqlite(reference, `update payload_migrations set batch = 2 where name = '${last}';`);
  const rowsLeft = () => (fs.existsSync(reference) ? rows(reference, `select count(*) from payload_migrations;`)[0][0] : "");
  const down = payloadOnReference(() => rowsLeft() === String(count - 1), "migrate:down");
  if (down.status !== 0) giveUp(`roll back ${last} on the reference`, down);
  const left = rows(reference, `select count(*) from payload_migrations;`)[0][0];
  if (left !== String(count - 1)) giveUp(`roll back ${last} on the reference: ${left} migration(s) left`, down);
  console.log("done.");
}

fs.rmSync(referenceDir, { recursive: true, force: true });

if (matched === 0) {
  const through = migrations[closest.count - 1];
  fail(
    `This database does not match the result of any run of migrations from the first.`,
    `Closest is through ${through} — ${closest.differences.length} difference(s):`,
    ``,
    ...closest.differences.slice(0, 20).map((line) => `  ${line}`),
    ...(closest.differences.length > 20 ? [`  … and ${closest.differences.length - 20} more`] : []),
    ``,
    `So no migration can be said to have effectively been applied, and recording`,
    `one as applied would leave every later migration running against a schema`,
    `nobody verified. Refusing.`,
  );
}

const claimed = migrations.slice(0, matched);
const pending = migrations.slice(matched);

/* ── Write it down, in one transaction ──────────────────────────────────── */

const backup = `${file}.before-baseline-${new Date().toISOString().replace(/[:.]/g, "-")}`;
fs.copyFileSync(file, backup);

/* One statement, one process, one transaction. Split across several sqlite3
   runs this could fail between them and leave a database with no migration
   rows at all — which is neither where it started nor where it was going. */
sqlite(
  file,
  `BEGIN IMMEDIATE;
   DELETE FROM payload_migrations WHERE batch < 0;
   ${claimed.map((name) => `INSERT INTO payload_migrations (name, batch) VALUES ('${name}', 1);`).join("\n   ")}
   COMMIT;`,
);

const recorded = rows(file, `select name, batch from payload_migrations order by name;`);
if (recorded.map(([name, batch]) => `${name}/${batch}`).join("\n") !== claimed.map((name) => `${name}/1`).join("\n")) {
  fail(
    `The write did not take: payload_migrations says`,
    ...recorded.map(([name, batch]) => `  ${name} / ${batch}`),
    `The backup is at ${backup}.`,
  );
}

console.log(`
Baselined ${path.relative(root, file)}

  compared     ${compared} tables — columns, defaults, primary keys,
               foreign keys and indexes — against a database built by
               running ${claimed.length} migration(s) on an empty file
  backup       ${path.relative(root, backup)}
  recorded     ${claimed.join(", ")} as batch 1,
               replacing the development push marker
${
  pending.length === 0
    ? `
\`npm run migrate\` will now report nothing to do, and the next migration you
create will apply to this database normally.`
    : `  pending      ${pending.join(", ")}

This database predates ${pending.length === 1 ? "that migration" : "those migrations"}. Back it up, then
\`npm run migrate\` applies ${pending.length === 1 ? "it" : "them"}.`
}
`);

/* For a remote libSQL database the write is the same statements:
     BEGIN IMMEDIATE;
     DELETE FROM payload_migrations WHERE batch < 0;
     INSERT INTO payload_migrations (name, batch) VALUES ('<each matched migration>', 1);
     COMMIT;
   Make the same comparison first. Do not skip it because it is tedious. */
