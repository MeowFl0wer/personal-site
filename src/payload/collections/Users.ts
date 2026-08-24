import type { CollectionConfig } from "payload";
import { ownerOnly } from "../access";

/**
 * Owner authentication.
 *
 * Payload's built-in auth handles the password hashing, sessions, cookies,
 * lockout and password reset. None of that is reimplemented here — the brief
 * is explicit that authentication is not something to hand-roll.
 *
 * The first user is created by `npm run seed`, or by the sign-up screen Payload
 * shows at /admin when the collection is empty.
 */
export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    group: "Site",
    useAsTitle: "email",
    description: "You. There is no reason for a second row here.",
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 8,
    lockTime: 1000 * 60 * 10,
  },
  access: {
    read: ownerOnly,
    create: ownerOnly,
    update: ownerOnly,
    delete: ownerOnly,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [{ name: "name", type: "text" }],
};
