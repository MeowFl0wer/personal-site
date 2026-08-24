import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Projects } from "./payload/collections/Projects";
import { Life } from "./payload/collections/Life";
import { Gallery } from "./payload/collections/Gallery";
import { BuiltTools, UsedTools } from "./payload/collections/Tools";
import { Posts } from "./payload/collections/Posts";
import { Home } from "./payload/globals/Home";
import { Resume } from "./payload/globals/Resume";
import { SiteSettings } from "./payload/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Payload configuration.
 *
 * Database — SQLite through libSQL. One file, trivial to back up (copy it),
 * type-safe end to end, and no server to run locally. `DATABASE_URI` accepts
 * both `file:./data/site.db` and a remote `libsql://…` URL, so moving to a
 * hosted database for production is an env var, not a migration of code.
 *
 * Media — local disk in development. Setting the S3 env vars switches every
 * upload to object storage (Cloudflare R2, Backblaze B2, S3) without changing
 * a single collection or component, because uploads are addressed by Payload,
 * not by path. Production must use this: files written to /public do not
 * survive a redeploy on most hosts.
 */

const useS3 = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " — Admin",
    },
    components: {
      // The dashboard replaces Payload's default "nothing here yet" landing.
      beforeDashboard: ["@/payload/components/Dashboard#Dashboard"],
    },
  },

  collections: [Users, Media, Projects, Life, Gallery, BuiltTools, UsedTools, Posts],
  globals: [Home, Resume, SiteSettings],

  editor: lexicalEditor({}),

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI ?? "file:./data/site.db",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    // Dev pushes schema changes straight to the file; production uses the
    // migrations committed alongside the code.
    push: process.env.NODE_ENV !== "production",
  }),

  secret: process.env.PAYLOAD_SECRET ?? "change-me-in-env-local",

  // Generated types are committed, so the frontend content layer is type-safe
  // against the actual schema rather than against a hand-written guess.
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },

  sharp,

  plugins: useS3
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET!,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION ?? "auto",
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
          },
        }),
      ]
    : [],

  cors: [process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"],
});
