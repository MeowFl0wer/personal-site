import type { GlobalConfig } from "payload";
import { anyone, ownerOnly } from "../access";
import { revalidateGlobal } from "../hooks/revalidate";

/**
 * The arrangements of printed pieces in the empty half of the home hero.
 *
 * This is the one place on the site where an editor arranges something
 * visually rather than filling in a field, so the shape of the data is chosen
 * for the drag surface rather than for the form: a card, and pieces placed on
 * it in percentages of the card's own box. Percentages rather than pixels
 * because the card is fluid — it is a clamp, not a size — and a pixel offset
 * would drift across viewports.
 *
 * The ground wash travels with the arrangement. It is the only case where the
 * CMS may set a colour beyond the accent, and it is deliberately four
 * near-white stops rather than a free palette: they are the corners of one
 * gradient, and anything saturated enough to notice would fight the type.
 */
export const Collage: GlobalConfig = {
  slug: "collage",
  label: "Home Artwork",
  admin: {
    group: "Site",
    description:
      "The cards and cut-outs in the right half of the home page, and the ground wash that travels with each one.",
  },
  access: { read: anyone, update: ownerOnly },
  hooks: { afterChange: [revalidateGlobal(["/"])] },
  fields: [
    {
      name: "autoplay",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description:
          "Move to the next arrangement on its own. Held while the pointer is over it, stopped for good once a visitor picks one, and never started for anyone who has asked for reduced motion.",
      },
    },
    {
      name: "dwell",
      type: "number",
      defaultValue: 7,
      min: 3,
      max: 30,
      admin: {
        description: "Seconds each arrangement holds before the next slides in.",
        condition: (data) => data?.autoplay !== false,
      },
    },
    {
      name: "themes",
      type: "array",
      minRows: 1,
      labels: { singular: "Arrangement", plural: "Arrangements" },
      admin: {
        description:
          "One per dot, in this order. Drag to reorder; the dots follow. Fewer than two and the dots stop being drawn.",
        components: {
          RowLabel: "@/payload/globals/CollageLabel#CollageLabel",
        },
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              admin: {
                width: "50%",
                description: "Read out by the dot. One word is plenty.",
              },
            },
            {
              name: "card",
              type: "upload",
              relationTo: "media",
              required: true,
              admin: {
                width: "50%",
                description: "The printed card everything else sits on. Portrait, 4:5.",
              },
            },
          ],
        },
        {
          name: "alt",
          type: "text",
          admin: {
            description:
              "What the card shows, for anyone who cannot see it. The cut-outs are decoration and carry none.",
          },
        },
        {
          name: "arrange",
          type: "ui",
          admin: {
            components: {
              Field: "@/payload/globals/CollageArranger#CollageArranger",
            },
          },
        },
        {
          name: "pieces",
          type: "array",
          labels: { singular: "Cut-out", plural: "Cut-outs" },
          admin: {
            description:
              "Laid over the card in this order — the last one is on top. Positions are percentages of the card, so a negative value hangs a piece off the edge, which is most of what makes it look stuck on rather than printed.",
            components: {
              RowLabel: "@/payload/globals/CollageLabel#PieceLabel",
            },
          },
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              type: "row",
              fields: [
                {
                  name: "x",
                  type: "number",
                  required: true,
                  defaultValue: 30,
                  admin: { width: "25%", description: "Left edge, % of card" },
                },
                {
                  name: "y",
                  type: "number",
                  required: true,
                  defaultValue: 30,
                  admin: { width: "25%", description: "Top edge, % of card" },
                },
                {
                  name: "width",
                  type: "number",
                  required: true,
                  defaultValue: 35,
                  min: 4,
                  max: 140,
                  admin: { width: "25%", description: "Width, % of card" },
                },
                {
                  name: "rotate",
                  type: "number",
                  required: true,
                  defaultValue: 0,
                  min: -45,
                  max: 45,
                  admin: { width: "25%", description: "Degrees" },
                },
              ],
            },
            {
              name: "behind",
              type: "checkbox",
              admin: { description: "Tuck this one under the card instead of over it." },
            },
          ],
        },
        {
          name: "wash",
          type: "group",
          admin: {
            description:
              "The four corners of the ground gradient, from the top-left of the viewport to the bottom-right. Keep them near-white: this is meant to read as a change of light, not a change of site.",
          },
          fields: [
            {
              type: "row",
              fields: [
                { name: "sky", type: "text", required: true, admin: { width: "25%" } },
                { name: "haze", type: "text", required: true, admin: { width: "25%" } },
                { name: "landFade", type: "text", required: true, admin: { width: "25%" } },
                { name: "land", type: "text", required: true, admin: { width: "25%" } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
