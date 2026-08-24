import type { GlobalConfig } from "payload";
import { anyone, ownerOnly } from "../access";
import { previewUrl } from "../preview";
import { revalidateGlobal } from "../hooks/revalidate";

/**
 * Home page content and section order.
 *
 * Every word on the home page comes from here — the greeting, the five hero
 * lines, the intro, the sign-off. None of it is in a component any more.
 *
 * `sections` is a drag-to-reorder list of the home page's designed blocks.
 * Hero is marked required in the frontend renderer, so it can be moved but not
 * removed: a home page with no opening is not a layout choice, it is a mistake.
 */
export const Home: GlobalConfig = {
  slug: "home",
  label: "Home",
  admin: {
    group: "Content",
    description: "The home page: identity, hero, and the order of its sections.",
    livePreview: { url: () => previewUrl("home", "/") },
    preview: () => previewUrl("home", "/"),
  },
  access: { read: anyone, update: ownerOnly },
  versions: { drafts: { autosave: { interval: 800 } }, max: 30 },
  hooks: { afterChange: [revalidateGlobal(["/"])] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identity",
          fields: [
            {
              type: "row",
              fields: [
                { name: "name", type: "text", required: true, admin: { width: "50%" } },
                {
                  name: "shortName",
                  type: "text",
                  admin: { width: "50%", description: "Used in the browser tab suffix." },
                },
              ],
            },
            {
              name: "roles",
              type: "text",
              hasMany: true,
              admin: { description: 'e.g. "Developer", "Builder", "Photographer".' },
            },
            {
              type: "row",
              fields: [
                { name: "basedIn", type: "text", admin: { width: "50%" } },
                { name: "year", type: "text", admin: { width: "50%" } },
              ],
            },
            { name: "currently", type: "text" },
            {
              name: "interests",
              type: "text",
              hasMany: true,
            },
          ],
        },
        {
          label: "Hero",
          fields: [
            {
              name: "greeting",
              type: "text",
              required: true,
              admin: { description: 'The opening line, e.g. "Hi, I\'m Your Name 👋". Emoji are fine.' },
            },
            {
              name: "headline",
              type: "array",
              minRows: 1,
              labels: { singular: "Line", plural: "Lines" },
              admin: {
                description:
                  "One line of very large type per row. Keep each under about 15 characters or it will wrap on a laptop.",
              },
              fields: [{ name: "text", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Intro",
          fields: [
            {
              name: "intro",
              type: "array",
              labels: { singular: "Paragraph", plural: "Paragraphs" },
              fields: [{ name: "text", type: "textarea", required: true }],
            },
          ],
        },
        {
          label: "Sections",
          description: "Drag to reorder the home page. Uncheck to hide a section.",
          fields: [
            {
              name: "sections",
              type: "array",
              labels: { singular: "Section", plural: "Sections" },
              admin: {
                components: {
                  RowLabel: "@/payload/globals/HomeSectionLabel#HomeSectionLabel",
                },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "block",
                      type: "select",
                      required: true,
                      admin: { width: "50%" },
                      options: [
                        { value: "hero", label: "Hero" },
                        { value: "about", label: "About" },
                        { value: "work", label: "Selected Work" },
                        { value: "life", label: "Life Preview" },
                        { value: "tools", label: "Tools Preview" },
                        { value: "elsewhere", label: "About / Contact" },
                      ],
                    },
                    { name: "visible", type: "checkbox", defaultValue: true, admin: { width: "25%" } },
                    {
                      name: "motion",
                      type: "select",
                      defaultValue: "default",
                      admin: { width: "25%" },
                      options: [
                        { value: "none", label: "No motion" },
                        { value: "subtle", label: "Subtle" },
                        { value: "default", label: "Default" },
                      ],
                    },
                  ],
                },
                {
                  name: "label",
                  type: "text",
                  admin: {
                    description:
                      "Overrides the mono section label, e.g. “Away from the screen”. Leave empty for the default.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
