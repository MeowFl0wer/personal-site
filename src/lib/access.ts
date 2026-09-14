import { getPayload } from "payload";
import config from "@/payload.config";
import { ACCESS_COOKIE, seal } from "@/lib/unlocked";

/**
 * Redeeming a grant.
 *
 * The checking half lives in lib/unlocked, which the Payload config imports and
 * therefore has to stay light. This half needs Payload itself, so it stays out
 * here where only a route handler calls it.
 */

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
  /* All whitespace, not just the ends. The alphabet was chosen so the code
     survives being read down a phone, and someone reading one out loud groups
     it — so someone typing it back writes the groups. `trim()` alone made the
     guide's claim that spaces are ignored untrue. */
  const code = input.replace(/\s+/g, "").toUpperCase();
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
      name: ACCESS_COOKIE,
      // The cookie expires with the grant, never after it.
      value: seal(String(grant.id), expiresAt),
      expires: new Date(expiresAt),
    },
  };
};

