import type { GlobalConfig } from "payload";
import { anyone, ownerOnly } from "../access";
import { previewUrl } from "../preview";
import { revalidateGlobal } from "../hooks/revalidate";

/**
 * About / Resume — ONE data source for both outputs.
 *
 * /about renders this on screen: the portrait and introduction read as a
 * personal page, and the record beneath them is a formal resume. The print
 * stylesheet turns that same DOM into an A4 document. There is no second PDF,
 * no `resume-pdf` collection, and no way for the two to disagree.
 *
 * The slug stays `resume` on purpose. It is the database table name, and
 * renaming a table to match a URL is a migration bought for nothing.
 */
export const Resume: GlobalConfig = {
  slug: "resume",
  label: "About",
  admin: {
    group: "Content",
    description:
      "The /about page: portrait, introduction, and the formal record. Also what the Print / Save PDF button produces.",
    livePreview: { url: () => previewUrl("resume", "/about") },
    preview: () => previewUrl("resume", "/about"),
  },
  access: { read: anyone, update: ownerOnly },
  versions: { drafts: { autosave: { interval: 800 } }, max: 30 },
  hooks: { afterChange: [revalidateGlobal(["/about"])] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Profile",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              admin: { description: 'The formal role line, e.g. "Developer / Interface Engineer".' },
            },
            {
              name: "portrait",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "The photograph beside the introduction. A portrait crop reads best — it is displayed at 4:5. Left out of the printed A4, which is a document rather than a page.",
              },
            },
            {
              name: "profile",
              type: "array",
              labels: { singular: "Paragraph", plural: "Paragraphs" },
              admin: {
                description:
                  "The introduction at the top of /about, set large. Two or three paragraphs; this is the part someone actually reads.",
              },
              fields: [{ name: "text", type: "textarea", required: true }],
            },
            { name: "printNote", type: "text", admin: { description: "Small line at the end, print included." } },
          ],
        },
        {
          label: "Experience",
          fields: [
            {
              name: "experience",
              type: "array",
              labels: { singular: "Role", plural: "Experience" },
              admin: {
                description: "Drag to reorder. Newest first reads best.",
                components: { RowLabel: "@/payload/globals/EntryLabel#EntryLabel" },
              },
              fields: entryFields(),
            },
          ],
        },
        {
          label: "Education",
          fields: [
            {
              name: "education",
              type: "array",
              labels: { singular: "Qualification", plural: "Education" },
              admin: { components: { RowLabel: "@/payload/globals/EntryLabel#EntryLabel" } },
              fields: entryFields(),
            },
          ],
        },
        {
          label: "Projects & Skills",
          fields: [
            {
              name: "projects",
              type: "array",
              labels: { singular: "Project", plural: "Projects" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", type: "text", required: true, admin: { width: "60%" } },
                    { name: "period", type: "text", admin: { width: "40%" } },
                  ],
                },
                { name: "body", type: "textarea" },
              ],
            },
            {
              name: "skills",
              type: "array",
              labels: { singular: "Group", plural: "Skills" },
              fields: [
                { name: "category", type: "text", required: true },
                { name: "items", type: "text", hasMany: true },
              ],
            },
            {
              name: "awards",
              type: "array",
              labels: { singular: "Award", plural: "Awards" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", type: "text", required: true, admin: { width: "60%" } },
                    { name: "period", type: "text", admin: { width: "40%" } },
                  ],
                },
                { name: "body", type: "textarea" },
              ],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "contact",
              type: "array",
              labels: { singular: "Link", plural: "Contact" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", type: "text", required: true, admin: { width: "35%" } },
                    { name: "href", type: "text", required: true, admin: { width: "50%" } },
                    { name: "external", type: "checkbox", defaultValue: true, admin: { width: "15%" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** Experience and Education share a shape, so they share a field set. */
function entryFields() {
  return [
    {
      type: "row" as const,
      fields: [
        { name: "organisation", type: "text" as const, required: true, admin: { width: "50%" } },
        { name: "role", type: "text" as const, required: true, admin: { width: "50%" } },
      ],
    },
    {
      type: "row" as const,
      fields: [
        { name: "start", type: "text" as const, admin: { width: "25%", description: "e.g. 2021" } },
        { name: "end", type: "text" as const, admin: { width: "25%", description: "Blank if current" } },
        { name: "current", type: "checkbox" as const, admin: { width: "20%" } },
        { name: "location", type: "text" as const, admin: { width: "30%" } },
      ],
    },
    {
      name: "body",
      type: "array" as const,
      labels: { singular: "Paragraph", plural: "Description" },
      fields: [{ name: "text", type: "textarea" as const, required: true }],
    },
    {
      name: "highlights",
      type: "array" as const,
      labels: { singular: "Highlight", plural: "Highlights" },
      fields: [{ name: "text", type: "textarea" as const, required: true }],
    },
  ];
}
