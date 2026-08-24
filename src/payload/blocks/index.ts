import type { Block } from "payload";
import { layoutGroup, ratioField, fitField } from "../fields/layout";

/**
 * THE BLOCK LIBRARY — a constrained block editor, not a page builder.
 *
 * Each block is a designed component that already exists in /src/components.
 * The admin chooses *which* blocks, in *what order*, with a small set of named
 * layout presets. It cannot introduce a new visual idea, a colour, a font or a
 * timing value, because no field here accepts one.
 *
 * Adding a block is a two-step change, on purpose:
 *   1. define it here,
 *   2. write its renderer in src/components/blocks/.
 * A block with no renderer never reaches a page.
 */

const caption = {
  name: "caption",
  type: "text",
  admin: { description: "Optional. Shown as small mono type under the media." },
} as const;

const altReminder = {
  name: "alt",
  type: "text",
  admin: {
    description: "Overrides the alt text stored on the media item. Leave empty to use that.",
  },
} as const;

/* ------------------------------------------------------------------- text */

export const TextBlock: Block = {
  slug: "text",
  interfaceName: "TextBlock",
  labels: { singular: "Text", plural: "Text" },
  fields: [
    { name: "body", type: "richText", required: true },
    layoutGroup({ width: "normal" }),
  ],
};

export const HeadingBlock: Block = {
  slug: "heading",
  interfaceName: "HeadingBlock",
  labels: { singular: "Heading", plural: "Headings" },
  fields: [
    { name: "text", type: "text", required: true },
    {
      name: "level",
      type: "select",
      defaultValue: "h2",
      options: [
        { value: "h2", label: "Section heading" },
        { value: "h3", label: "Sub heading" },
      ],
    },
    layoutGroup({ width: "normal", spacing: "small" }),
  ],
};

export const StatementBlock: Block = {
  slug: "statement",
  interfaceName: "StatementBlock",
  labels: { singular: "Large Statement", plural: "Large Statements" },
  admin: { group: "Editorial" },
  fields: [
    {
      name: "lines",
      type: "array",
      minRows: 1,
      labels: { singular: "Line", plural: "Lines" },
      admin: { description: "One line of display type per row. Keep them short." },
      fields: [{ name: "text", type: "text", required: true }],
    },
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

export const SectionIntroBlock: Block = {
  slug: "sectionIntro",
  interfaceName: "SectionIntroBlock",
  labels: { singular: "Section Intro", plural: "Section Intros" },
  admin: { group: "Editorial" },
  fields: [
    {
      type: "row",
      fields: [
        { name: "index", type: "text", required: true, defaultValue: "01", admin: { width: "30%" } },
        { name: "label", type: "text", required: true, admin: { width: "70%" } },
      ],
    },
    {
      name: "lead",
      type: "array",
      labels: { singular: "Line", plural: "Lines" },
      fields: [{ name: "text", type: "text", required: true }],
    },
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

export const QuoteBlock: Block = {
  slug: "quote",
  interfaceName: "QuoteBlock",
  labels: { singular: "Pull Quote", plural: "Pull Quotes" },
  admin: { group: "Editorial" },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "attribution", type: "text" },
    layoutGroup({ width: "normal", spacing: "large" }),
  ],
};

export const StatsBlock: Block = {
  slug: "stats",
  interfaceName: "StatsBlock",
  labels: { singular: "Stats", plural: "Stats" },
  admin: { group: "Editorial" },
  fields: [
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 6,
      labels: { singular: "Figure", plural: "Figures" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", required: true, admin: { width: "50%" } },
            { name: "value", type: "text", required: true, admin: { width: "50%" } },
          ],
        },
      ],
    },
    layoutGroup({ width: "normal", spacing: "medium" }),
  ],
};

export const LocationMetaBlock: Block = {
  slug: "locationMeta",
  interfaceName: "LocationMetaBlock",
  labels: { singular: "Location Metadata", plural: "Location Metadata" },
  admin: { group: "Editorial" },
  fields: [
    {
      type: "row",
      fields: [
        { name: "place", type: "text", admin: { width: "50%" } },
        { name: "date", type: "text", admin: { width: "50%" } },
      ],
    },
    { name: "coordinates", type: "text", admin: { description: "Optional, e.g. 36.5° N, 118.1° E" } },
    layoutGroup({ width: "normal", spacing: "medium" }),
  ],
};

/* ------------------------------------------------------------------ media */

/**
 * Three image blocks rather than one with a width menu: the brief asks for
 * Image / Wide Image / Full Bleed by name, and naming them is genuinely easier
 * to reach for. They share a single renderer — only the default width differs.
 */
const imageFields = (width: "normal" | "wide" | "full") => [
  { name: "image", type: "upload" as const, relationTo: "media" as const, required: true },
  { type: "row" as const, fields: [fitField(), { ...caption, admin: { width: "50%" } }] },
  altReminder,
  {
    name: "parallax",
    type: "checkbox" as const,
    defaultValue: width !== "normal",
    admin: { description: "Gentle scroll parallax. Ignored when motion is reduced." },
  },
  layoutGroup({ width, spacing: "large" }),
];

export const ImageBlock: Block = {
  slug: "image",
  interfaceName: "ImageBlock",
  labels: { singular: "Image", plural: "Images" },
  admin: { group: "Media" },
  fields: imageFields("normal"),
};

export const WideImageBlock: Block = {
  slug: "wideImage",
  interfaceName: "WideImageBlock",
  labels: { singular: "Wide Image", plural: "Wide Images" },
  admin: { group: "Media" },
  fields: imageFields("wide"),
};

export const FullBleedImageBlock: Block = {
  slug: "fullBleedImage",
  interfaceName: "FullBleedImageBlock",
  labels: { singular: "Full Bleed Image", plural: "Full Bleed Images" },
  admin: { group: "Media" },
  fields: imageFields("full"),
};

export const PhotoPairBlock: Block = {
  slug: "photoPair",
  interfaceName: "PhotoPairBlock",
  labels: { singular: "Photo Pair", plural: "Photo Pairs" },
  admin: { group: "Media" },
  fields: [
    {
      type: "row",
      fields: [
        { name: "left", type: "upload", relationTo: "media", required: true, admin: { width: "50%" } },
        { name: "right", type: "upload", relationTo: "media", required: true, admin: { width: "50%" } },
      ],
    },
    { type: "row", fields: [ratioField(), fitField()] },
    {
      name: "offset",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Drop the second image to create an editorial stagger." },
    },
    caption,
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

export const ImageTextBlock: Block = {
  slug: "imageText",
  interfaceName: "ImageTextBlock",
  labels: { singular: "Image + Text", plural: "Image + Text" },
  admin: { group: "Media" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "body", type: "richText", required: true },
    {
      type: "row",
      fields: [
        {
          name: "order",
          type: "select",
          defaultValue: "image-left",
          admin: { width: "50%" },
          options: [
            { value: "image-left", label: "Image left" },
            { value: "image-right", label: "Image right" },
          ],
        },
        ratioField(),
      ],
    },
    caption,
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

export const VideoBlock: Block = {
  slug: "video",
  interfaceName: "VideoBlock",
  labels: { singular: "Video", plural: "Videos" },
  admin: { group: "Media" },
  fields: [
    { name: "video", type: "upload", relationTo: "media", required: true },
    { name: "poster", type: "upload", relationTo: "media", admin: { description: "Frame shown before playback." } },
    {
      type: "row",
      fields: [
        { name: "autoplay", type: "checkbox", defaultValue: true, admin: { width: "33%" } },
        { name: "loop", type: "checkbox", defaultValue: true, admin: { width: "33%" } },
        { name: "controls", type: "checkbox", defaultValue: false, admin: { width: "33%" } },
      ],
    },
    caption,
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

export const GalleryBlock: Block = {
  slug: "gallery",
  interfaceName: "GalleryBlock",
  labels: { singular: "Gallery", plural: "Galleries" },
  admin: { group: "Media" },
  fields: [
    {
      name: "photos",
      type: "relationship",
      relationTo: "gallery",
      hasMany: true,
      admin: { description: "Leave empty to show the most recent gallery photos." },
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 6,
      min: 2,
      max: 24,
      admin: { description: "Used only when no photos are chosen above." },
    },
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

/* ------------------------------------------------------------ interactive */

/**
 * Interactive blocks are references to components that already exist and are
 * already designed. There is no block anywhere that lets the admin place a raw
 * WebGL scene, tune a shader, or set an animation duration.
 */
export const ProjectPreviewBlock: Block = {
  slug: "projectPreview",
  interfaceName: "ProjectPreviewBlock",
  labels: { singular: "Project Preview", plural: "Project Previews" },
  admin: { group: "Interactive" },
  fields: [
    { name: "projects", type: "relationship", relationTo: "projects", hasMany: true },
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

export const ToolPreviewBlock: Block = {
  slug: "toolPreview",
  interfaceName: "ToolPreviewBlock",
  labels: { singular: "Tool Preview", plural: "Tool Previews" },
  admin: { group: "Interactive" },
  fields: [
    { name: "tools", type: "relationship", relationTo: "built-tools", hasMany: true },
    layoutGroup({ width: "wide", spacing: "large" }),
  ],
};

/** The full set, offered on Work case studies, Life stories and Blog posts. */
export const contentBlocks: Block[] = [
  TextBlock,
  HeadingBlock,
  StatementBlock,
  SectionIntroBlock,
  QuoteBlock,
  StatsBlock,
  LocationMetaBlock,
  ImageBlock,
  WideImageBlock,
  FullBleedImageBlock,
  PhotoPairBlock,
  ImageTextBlock,
  VideoBlock,
  GalleryBlock,
  ProjectPreviewBlock,
  ToolPreviewBlock,
];
