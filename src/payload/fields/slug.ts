import type { Field } from "payload";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * URL slug, derived from a title but editable.
 *
 * Auto-fills only while empty, so renaming a published page never silently
 * moves its URL and breaks every link to it. Changing the slug stays a
 * deliberate act.
 */
export const slugField = (from: string): Field => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "The URL. Filled in from the title; changing it later breaks existing links.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === "string" && value.length > 0) return slugify(value);
        const source = data?.[from];
        return typeof source === "string" ? slugify(source) : value;
      },
    ],
  },
});
