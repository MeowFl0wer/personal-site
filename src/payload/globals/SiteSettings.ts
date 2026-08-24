import type { GlobalConfig } from "payload";
import { anyone, ownerOnly } from "../access";
import { revalidateEverything } from "../hooks/revalidate";
import { SOCIAL_ICONS } from "@/components/ui/social-icons";

/**
 * Site-wide settings, navigation and feature toggles.
 *
 * Note what is NOT here: fonts, type scale, radii, shadows, easings, durations.
 * Those are the design system and they live in Git. The one visual value the
 * admin can set is the accent colour, and it is a fixed list of tones chosen to
 * work with the palette — not a colour picker.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Settings",
  admin: {
    group: "Site",
    description: "Identity, SEO, navigation and feature toggles.",
  },
  access: { read: anyone, update: ownerOnly },
  // Nav, SEO and the blog toggle appear on every page.
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              type: "row",
              fields: [
                { name: "siteName", type: "text", required: true, admin: { width: "50%" } },
                { name: "siteUrl", type: "text", admin: { width: "50%" } },
              ],
            },
            { name: "email", type: "email", required: true },
            {
              name: "accentColor",
              type: "select",
              defaultValue: "clay",
              admin: {
                description:
                  "The single accent tone. Chosen from the palette rather than picked freely, so it always sits correctly against the warm white.",
              },
              options: [
                { value: "clay", label: "Clay (default)" },
                { value: "ink", label: "Ink" },
                { value: "moss", label: "Moss" },
                { value: "slate", label: "Slate" },
                { value: "ochre", label: "Ochre" },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "seoTitle", type: "text", required: true },
            { name: "seoDescription", type: "textarea", required: true },
            {
              name: "seoImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Shown when a link to the site is shared." },
            },
          ],
        },
        {
          label: "Navigation",
          description:
            "Reorder and rename. The URLs are fixed on purpose — letting them be edited is how a personal site ends up with dead links.",
          fields: [
            {
              name: "navigation",
              type: "array",
              labels: { singular: "Item", plural: "Navigation" },
              admin: { components: { RowLabel: "@/payload/globals/NavLabel#NavLabel" } },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "route",
                      type: "select",
                      required: true,
                      admin: { width: "40%" },
                      options: [
                        { value: "/about", label: "/about" },
                        { value: "/work", label: "/work" },
                        { value: "/tools", label: "/tools" },
                        { value: "/life", label: "/life" },
                        { value: "/blog", label: "/blog" },
                        { value: "/gallery", label: "/gallery" },
                      ],
                    },
                    { name: "label", type: "text", required: true, admin: { width: "40%" } },
                    { name: "visible", type: "checkbox", defaultValue: true, admin: { width: "20%" } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Social",
          description:
            "Shown as icons in the Elsewhere block and the footer. Drag to reorder.",
          fields: [
            {
              name: "socials",
              type: "array",
              labels: { singular: "Link", plural: "Social Links" },
              admin: { components: { RowLabel: "@/payload/globals/SocialLabel#SocialLabel" } },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "platform",
                      type: "select",
                      required: true,
                      defaultValue: "website",
                      admin: { width: "34%", description: "Picks the icon." },
                      // Straight from the icon set, so the menu can never offer
                      // a platform there is no glyph for.
                      options: Object.entries(SOCIAL_ICONS)
                        .map(([value, icon]) => ({ value, label: icon.label }))
                        .sort((a, b) => a.label.localeCompare(b.label)),
                    },
                    { name: "label", type: "text", required: true, admin: { width: "33%" } },
                    { name: "handle", type: "text", admin: { width: "33%" } },
                  ],
                },
                { name: "href", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Features",
          fields: [
            {
              name: "blogEnabled",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description:
                  "Off: /blog still works, but Writing is not shown in the navigation or on the home page. On: Writing appears in its reserved slot. No code change either way.",
              },
            },
            {
              name: "cursorEnabled",
              type: "checkbox",
              defaultValue: true,
              admin: { description: "The custom desktop cursor. Always off on touch and reduced motion." },
            },
            {
              name: "webglGallery",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description:
                  "The 3D ring on /gallery. Off falls back to the editorial grid, which is also what small screens and reduced motion get.",
              },
            },
          ],
        },
      ],
    },
  ],
};
