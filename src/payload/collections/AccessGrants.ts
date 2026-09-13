import type { CollectionConfig } from "payload";
import { ownerOnly } from "../access";

/**
 * Who may see the parts of /about that are not public, and what happened to
 * the invitation.
 *
 * One grant is one secret. The same string is both the code someone types and
 * the tail of the link you send them, so there is a single thing to name, a
 * single thing to revoke, and a single row that answers "has this been used".
 *
 * Nothing here is readable without being signed in — a grant list is a list of
 * valid passwords. The frontend never queries this collection; it goes through
 * lib/access.ts, which checks one code and returns a yes or a no.
 *
 * The record of use is deliberately thin: first seen, last seen, how many
 * times. Enough to answer "did this reach them" and "is this still being
 * passed around", without keeping an access log of people who are, after all,
 * friends. No addresses, no fingerprints.
 */
export const AccessGrants: CollectionConfig = {
  slug: "access-grants",
  labels: { singular: "Access Grant", plural: "Access" },
  admin: {
    group: "Site",
    useAsTitle: "recipient",
    defaultColumns: ["recipient", "purpose", "expiresAt", "useCount", "lastUsedAt"],
    description:
      "Codes and links that unlock the private parts of About. Give each one to a single person so that revoking it costs nothing.",
  },
  // A grant is a password. Not even `read` is public.
  access: { read: ownerOnly, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "recipient",
          type: "text",
          required: true,
          admin: { width: "50%", description: "Who this is for. A name is enough — it is for you." },
        },
        {
          name: "purpose",
          type: "text",
          required: true,
          admin: {
            width: "50%",
            description: 'Why they have it, e.g. "job application, Studio X".',
          },
        },
      ],
    },
    {
      name: "code",
      type: "text",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description:
          "Generated when you save. Type it into the prompt on the page, or send the link below.",
      },
    },
    {
      name: "link",
      type: "ui",
      admin: { components: { Field: "@/payload/collections/AccessGrantLink#AccessGrantLink" } },
    },
    {
      type: "row",
      fields: [
        {
          name: "expiresAt",
          type: "date",
          required: true,
          admin: {
            width: "50%",
            date: { pickerAppearance: "dayAndTime" },
            description: "After this, the code stops working. Shorten it rather than delete it.",
          },
        },
        {
          name: "revoked",
          type: "checkbox",
          admin: {
            width: "50%",
            description: "Turns it off now, and keeps the record of what it was for.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Use",
      admin: { initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "useCount", type: "number", defaultValue: 0, admin: { width: "33%", readOnly: true } },
            {
              name: "firstUsedAt",
              type: "date",
              admin: { width: "33%", readOnly: true, date: { pickerAppearance: "dayAndTime" } },
            },
            {
              name: "lastUsedAt",
              type: "date",
              admin: { width: "34%", readOnly: true, date: { pickerAppearance: "dayAndTime" } },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create") {
          /* Ten characters from an unambiguous alphabet: no O/0, no I/l/1. It
             has to survive being read down a phone and typed by hand, and 32^10
             is far past guessing when the endpoint is rate limited. */
          if (!data.code) {
            const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
            const bytes = new Uint8Array(10);
            crypto.getRandomValues(bytes);
            data.code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
          }
          if (!data.expiresAt) {
            const thirtyDays = new Date();
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            data.expiresAt = thirtyDays.toISOString();
          }
        }
        return data;
      },
    ],
  },
};
