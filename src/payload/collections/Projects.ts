import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks";
import { ownerOnly, readPublished } from "../access";
import { slugField } from "../fields/slug";
import { previewUrl } from "../preview";
import { revalidateCollection, revalidateCollectionDelete } from "../hooks/revalidate";

/**
 * Work — projects and case studies.
 *
 * The index page reads the summary fields; the case study is built from blocks,
 * so adding a project never means writing MDX or touching a component.
 */
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Work" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "year", "featured", "_status", "updatedAt"],
    description: "Case studies shown on /work.",
    livePreview: { url: ({ data }) => previewUrl("projects", `/work/${data?.slug ?? ""}`) },
    preview: (doc) => previewUrl("projects", `/work/${doc?.slug ?? ""}`),
  },
  access: { read: readPublished, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 30,
  },
  defaultSort: "order",
  orderable: true,
  hooks: {
    afterChange: [revalidateCollection((slug) => ["/", "/work", `/work/${slug}`])],
    afterDelete: [revalidateCollectionDelete((slug) => ["/", "/work", `/work/${slug}`])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Overview",
          fields: [
            { name: "title", type: "text", required: true },
            slugField("title"),
            {
              name: "summary",
              type: "textarea",
              required: true,
              admin: { description: "One line. Used in the index and in link previews." },
            },
            {
              type: "row",
              fields: [
                { name: "year", type: "text", required: true, admin: { width: "25%" } },
                {
                  name: "discipline",
                  type: "text",
                  required: true,
                  admin: { width: "40%", description: 'Mono meta line, e.g. "Web / AI".' },
                },
                { name: "role", type: "text", admin: { width: "35%" } },
              ],
            },
            {
              name: "stack",
              type: "text",
              hasMany: true,
              admin: { description: "One technology per entry." },
            },
            {
              type: "row",
              fields: [
                { name: "projectUrl", type: "text", admin: { width: "50%" } },
                { name: "githubUrl", type: "text", admin: { width: "50%" } },
              ],
            },
            {
              name: "featured",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description: "Shows on the home page's Selected Work. Keep this to three or four.",
              },
            },
          ],
        },
        {
          label: "Media",
          fields: [
            { name: "cover", type: "upload", relationTo: "media", required: true },
            {
              name: "previewVideo",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Optional short loop. When set, hovering the project in the index plays it instead of showing the cover.",
              },
            },
          ],
        },
        {
          label: "Case Study",
          description: "The body of /work/[slug]. Drag to reorder.",
          fields: [
            {
              name: "layout",
              type: "blocks",
              blocks: contentBlocks,
              admin: { initCollapsed: true },
            },
          ],
        },
      ],
    },
  ],
};
