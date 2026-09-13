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

const unseal = (token: string): { grantId: string } | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [grantId, expires, signature] = parts;
  const expected = sign(`${grantId}.${expires}`);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return { grantId };
};

/**
 * Is the grant this cookie was issued for still live?
 *
 * The cookie carries its own expiry and a signature over it, which is enough
 * to know it was issued and has not run out — and for a while that was the
 * whole check. It is not enough. Turning a grant off in the admin did nothing
 * to anyone already holding a cookie, who kept reading until it expired on its
 * own, which is not what "revoked" means to the person pressing it.
 *
 * So the grant is looked up as well. Only ever for a request that already has
 * a valid cookie — which is almost nobody — so the ordinary visitor still pays
 * nothing, and the imports are dynamic because this module is loaded by the
 * Payload config and cannot import it back.
 */
const grantIsLive = async (grantId: string): Promise<boolean> => {
  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import("payload"),
      import("@/payload.config"),
    ]);
    const payload = await getPayload({ config });
    const grant = await payload.findByID({
      collection: "access-grants",
      id: grantId,
      overrideAccess: true,
      disableErrors: true,
    });
    if (!grant || grant.revoked) return false;
    const expiresAt = grant.expiresAt ? Date.parse(grant.expiresAt) : 0;
    return Boolean(expiresAt) && expiresAt >= Date.now();
  } catch {
    /* A grant that cannot be read is not a grant that can be honoured. */
    return false;
  }
};

export const isUnlocked = async (): Promise<boolean> => {
  let token: string | undefined;
  try {
    /* Imported here rather than at the top: this module is loaded by the
       Payload config, and the config is loaded by scripts where next/headers
       has no business existing. */
    const { cookies } = await import("next/headers");
    token = (await cookies()).get(ACCESS_COOKIE)?.value;
  } catch {
    /* No request to read. That is a script, or the static export — and the
       export must answer no, because there is no server in it to be convinced
       otherwise and therefore nothing private in it either. */
    return false;
  }

  if (!token) return false;
  const opened = unseal(token);
  return opened ? grantIsLive(opened.grantId) : false;
};
