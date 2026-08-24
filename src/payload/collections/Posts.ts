import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks";
import { ownerOnly, readPublished } from "../access";
import { slugField } from "../fields/slug";
import { previewUrl } from "../preview";
import { revalidateCollection, revalidateCollectionDelete } from "../hooks/revalidate";

/**
 * Blog.
 *
 * Fully wired even while Writing is hidden from the navigation — the schema,
 * the editor, drafts, scheduling and preview all exist now, so switching the
 * blog on later is a toggle in Site Settings and nothing else.
 */
export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Blog" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    description: "Articles for /blog. Hidden from the nav until Blog is enabled in Site Settings.",
    livePreview: { url: ({ data }) => previewUrl("posts", `/blog/${data?.slug ?? ""}`) },
    preview: (doc) => previewUrl("posts", `/blog/${doc?.slug ?? ""}`),
  },
  access: { read: readPublished, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 50 },
  defaultSort: "-publishedAt",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Post",
          fields: [
            { name: "title", type: "text", required: true },
            slugField("title"),
            { name: "description", type: "textarea", required: true },
            {
              type: "row",
              fields: [
                { name: "category", type: "text", defaultValue: "Notes", admin: { width: "50%" } },
                { name: "featured", type: "checkbox", admin: { width: "50%" } },
              ],
            },
            { name: "tags", type: "text", hasMany: true },
            { name: "cover", type: "upload", relationTo: "media" },
            {
              name: "publishedAt",
              type: "date",
              admin: {
                position: "sidebar",
                description:
                  "Set a future date to schedule: the post stays off the site until then, even once published.",
                date: { pickerAppearance: "dayAndTime" },
              },
            },
          ],
        },
        {
          label: "Body",
          fields: [
            { name: "layout", type: "blocks", blocks: contentBlocks, admin: { initCollapsed: true } },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateCollection((slug) => ["/blog", `/blog/${slug}`])],
    afterDelete: [revalidateCollectionDelete((slug) => ["/blog", `/blog/${slug}`])],
    beforeChange: [
      ({ data, operation }) => {
        // Publishing without a date should mean "now", not "never".
        if (operation === "create" && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
};
