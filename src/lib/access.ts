import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * Who is allowed to see the private half of /about.
 *
 * The rule the whole design rests on: a locked visitor is never sent the
 * content. Not hidden with CSS, not delivered and covered — absent from the
 * response. Everything here exists to answer one question on the server before
 * anything is rendered, and `lib/cms.ts` is the only caller, which is what
 * keeps a new page from forgetting to ask.
 *
 * It is deliberately the same shape as draft mode, which this codebase already
 * uses: a cookie set by one route, read everywhere, and a read that answers
 * "no" when there is no request at all — which is the case during the static
 * export, where there is no server to check anything and therefore nothing
 * private may exist.
 */

const COOKIE = "about-access";

/** Signed so the cookie cannot be written by hand. */
const secret = () => process.env.PAYLOAD_SECRET ?? "";

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

const seal = (grantId: string, expiresAt: number) => {
  const body = `${grantId}.${expiresAt}`;
  return `${body}.${sign(body)}`;
};

const unseal = (token: string): { grantId: string; expiresAt: number } | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [grantId, expires, signature] = parts;
  const expected = sign(`${grantId}.${expires}`);
  // Both are base64url of the same length, so a constant-time compare is safe.
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return { grantId, expiresAt };
};

/**
 * True when this request carries a valid, unexpired grant.
 *
 * Not cached: `cookies()` already ties the render to the request, and a grant
 * revoked in the admin should stop working on the next page rather than on the
 * next deploy. The cost is a signature check, not a query — the cookie carries
 * its own expiry, so a live grant costs no database round trip.
 */
export const isUnlocked = async (): Promise<boolean> => {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    return token ? unseal(token) !== null : false;
  } catch {
    /* No request scope. That is the static export, where the answer has to be
       "no" — there is no server there to be convinced otherwise. */
    return false;
  }
};

export type GrantCheck =
  | { ok: true; cookie: { name: string; value: string; expires: Date } }
  | { ok: false; reason: "unknown" | "expired" | "revoked" };

/**
 * Checks a code and, if it holds, records that it was used.
 *
 * The record is three fields — first seen, last seen, how many times — and
 * that is the whole audit trail on purpose. It answers "did this reach them"
 * and "is this still being passed around" without keeping a log of where
 * someone was when they opened it.
 */
export const redeem = async (input: string): Promise<GrantCheck> => {
  const code = input.trim().toUpperCase();
  if (!code) return { ok: false, reason: "unknown" };

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "access-grants",
    where: { code: { equals: code } },
    limit: 1,
    overrideAccess: true,
  });

  const grant = docs[0];
  if (!grant) return { ok: false, reason: "unknown" };
  if (grant.revoked) return { ok: false, reason: "revoked" };

  const expiresAt = grant.expiresAt ? Date.parse(grant.expiresAt) : 0;
  if (!expiresAt || expiresAt < Date.now()) return { ok: false, reason: "expired" };

  const now = new Date().toISOString();
  await payload.update({
    collection: "access-grants",
    id: grant.id,
    overrideAccess: true,
    data: {
      useCount: (grant.useCount ?? 0) + 1,
      firstUsedAt: grant.firstUsedAt ?? now,
      lastUsedAt: now,
    },
  });

  return {
    ok: true,
    cookie: {
      name: COOKIE,
      // The cookie expires with the grant, never after it.
      value: seal(String(grant.id), expiresAt),
      expires: new Date(expiresAt),
    },
  };
};

export const ACCESS_COOKIE = COOKIE;
