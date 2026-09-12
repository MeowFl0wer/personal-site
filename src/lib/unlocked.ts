import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Whether this request may read the private half of /about.
 *
 * Separate from the rest of lib/access on purpose. The Media collection has to
 * ask this question, the Media collection is part of the Payload config, and
 * the config is loaded by scripts that are not a Next server — the seed, the
 * type generator, the CLI. So this module imports nothing heavy, nothing from
 * the config it is about to be imported *by*, and reaches for next/headers only
 * when it is actually called.
 *
 * The cookie carries its own expiry and a signature over it, so a live grant
 * costs a hash rather than a query. It cannot be extended or forged from the
 * browser, and it dies with the grant it came from.
 */

export const ACCESS_COOKIE = "about-access";

const sign = (value: string) =>
  createHmac("sha256", process.env.PAYLOAD_SECRET ?? "").update(value).digest("base64url");

export const seal = (grantId: string, expiresAt: number) => {
  const body = `${grantId}.${expiresAt}`;
  return `${body}.${sign(body)}`;
};

const unseal = (token: string) => {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [grantId, expires, signature] = parts;
  const expected = sign(`${grantId}.${expires}`);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return false;
  }
  const expiresAt = Number(expires);
  return Number.isFinite(expiresAt) && expiresAt >= Date.now();
};

export const isUnlocked = async (): Promise<boolean> => {
  try {
    /* Imported here rather than at the top: this module is loaded by the
       Payload config, and the config is loaded by scripts where next/headers
       has no business existing. */
    const { cookies } = await import("next/headers");
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;
    return token ? unseal(token) : false;
  } catch {
    /* No request to read. That is a script, or the static export — and the
       export must answer no, because there is no server in it to be convinced
       otherwise and therefore nothing private in it either. */
    return false;
  }
};
