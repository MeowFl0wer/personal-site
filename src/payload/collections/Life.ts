import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks";
import { ownerOnly, readPublished } from "../access";
import { slugField } from "../fields/slug";
import { previewUrl } from "../preview";
import { revalidateCollection, revalidateCollectionDelete } from "../hooks/revalidate";

/**
 * Life — field notes, not a hobbies list.
 *
 * This is the page that needs the most layout freedom, so it gets the full
 * block editor plus a layout preset. Hiking-specific figures live in their own
 * optional group: a travel note simply leaves them empty and they never render.
 */
export const Life: CollectionConfig = {
  slug: "life",
  labels: { singular: "Life Story", plural: "Life" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "date", "_status", "updatedAt"],
    description: "Trips, trails and field notes shown on /life.",
    livePreview: { url: ({ data }) => previewUrl("life", `/life/${data?.slug ?? ""}`) },
    preview: (doc) => previewUrl("life", `/life/${doc?.slug ?? ""}`),
  },
  access: { read: readPublished, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
  defaultSort: "order",
  orderable: true,
  hooks: {
    afterChange: [revalidateCollection((slug) => ["/", "/life", `/life/${slug}`])],
    afterDelete: [revalidateCollectionDelete((slug) => ["/", "/life", `/life/${slug}`])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Story",
          fields: [
            { name: "title", type: "text", required: true },
            slugField("title"),
            {
              type: "row",
              fields: [
                {
                  name: "category",
                  type: "select",
                  required: true,
                  defaultValue: "travel",
                  admin: { width: "33%" },
                  options: [
                    { value: "hiking", label: "Hiking" },
                    { value: "travel", label: "Travel" },
                    { value: "photography", label: "Photography" },
                    { value: "outdoor", label: "Outdoor" },
                    { value: "personal", label: "Personal" },
                    { value: "other", label: "Other" },
                  ],
                },
                { name: "place", type: "text", admin: { width: "34%" } },
                { name: "date", type: "text", admin: { width: "33%", description: 'e.g. "June 2026"' } },
              ],
            },
            { name: "description", type: "textarea" },
            { name: "cover", type: "upload", relationTo: "media" },
            {
              name: "coordinates",
              type: "text",
              admin: { description: "Optional. Displayed as mono metadata." },
            },
          ],
        },
        {
          label: "Trail",
          description: "Optional. Leave empty for anything that is not a walk.",
          fields: [
            {
              type: "row",
              fields: [
                { name: "distance", type: "text", admin: { width: "25%" } },
                { name: "elevation", type: "text", admin: { width: "25%" } },
                { name: "duration", type: "text", admin: { width: "25%" } },
                {
                  name: "difficulty",
                  type: "select",
                  admin: { width: "25%" },
                  options: [
                    { value: "easy", label: "Easy" },
                    { value: "moderate", label: "Moderate" },
                    { value: "hard", label: "Hard" },
                    { value: "serious", label: "Serious" },
                  ],
                },
              ],
            },
            { name: "trail", type: "text" },
          ],
        },
        {
          label: "Layout",
          description: "The body of /life/[slug]. Drag to reorder.",
          fields: [
            {
              name: "preset",
              type: "select",
              defaultValue: "editorial",
              admin: {
                description:
                  "A designed starting arrangement. All presets use the same design system.",
              },
              options: [
                { value: "editorial", label: "Editorial" },
                { value: "field-note", label: "Field Note" },
                { value: "photo-essay", label: "Photo Essay" },
                { value: "travel-journal", label: "Travel Journal" },
                { value: "minimal", label: "Minimal" },
              ],
            },
            {
              name: "theme",
              type: "select",
              defaultValue: "light",
              admin: { description: "Photo essays often read better on the dark ground." },
              options: [
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Auto" },
              ],
            },
            { name: "layout", type: "blocks", blocks: contentBlocks, admin: { initCollapsed: true } },
          ],
        },
      ],
    },
  ],
};
