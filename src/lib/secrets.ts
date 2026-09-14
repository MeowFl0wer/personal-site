/**
 * A missing secret has to be loud.
 *
 * Every one of these used to have a fallback — `?? "change-me-in-env-local"`,
 * `?? "dev-preview-secret"`, `?? ""`. They made the first run pleasant and they
 * were a bad trade, because the fallbacks are in a public repository. A deploy
 * that lost its environment did not fail; it came up, served pages, and looked
 * exactly like a working site while signing its cookies with a key anyone can
 * read. The signature on the access cookie is the whole of that door, and with
 * an empty key it is a door anyone can cut their own key to.
 *
 * So: in production a missing secret throws, and the process does not start. In
 * development it still falls back, because `npm run dev` on a fresh clone
 * should work — but it says so, once, rather than silently.
 *
 * Imports nothing on purpose. lib/unlocked is loaded by the Payload config,
 * which is loaded by scripts that are not a Next server, and this has to be
 * able to follow it there.
 */

const announced = new Set<string>();

export const requiredSecret = (name: string, developmentFallback: string): string => {
  const value = process.env[name];
  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `${name} is not set.\n` +
        `Refusing to start: the fallback for this value is published in the ` +
        `repository, so running without it is running without the protection ` +
        `it provides. Set it in the environment — see .env.example.`,
    );
  }

  if (!announced.has(name)) {
    announced.add(name);
    console.warn(
      `[secrets] ${name} is not set. Using a development-only value. ` +
        `This will refuse to start in production — see .env.example.`,
    );
  }
  return developmentFallback;
};
