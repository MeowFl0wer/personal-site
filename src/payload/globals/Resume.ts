import type { GlobalConfig } from "payload";
import { anyone, ownerOnly } from "../access";
import { previewUrl } from "../preview";
import { revalidateGlobal } from "../hooks/revalidate";

/**
 * Resume — ONE data source for both outputs.
 *
 * /resume renders this on screen, and the print stylesheet turns that same DOM
 * into an A4 document. There is no second PDF, no `resume-pdf` collection, and
 * no way for the two to disagree. Edit once, both update.
 */
export const Resume: GlobalConfig = {
  slug: "resume",
  label: "Resume",
  admin: {
    group: "Content",
    description: "The formal version. Also what the Print / Save PDF button produces.",
    livePreview: { url: () => previewUrl("resume", "/resume") },
    preview: () => previewUrl("resume", "/resume"),
  },
  access: { read: anyone, update: ownerOnly },
  versions: { drafts: { autosave: { interval: 800 } }, max: 30 },
  hooks: { afterChange: [revalidateGlobal(["/resume"])] },
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
              name: "profile",
              type: "array",
              labels: { singular: "Paragraph", plural: "Paragraphs" },
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
