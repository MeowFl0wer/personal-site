import type { CollectionConfig } from "payload";
import { anyone, ownerOnly } from "../access";

/**
 * The one Media Library.
 *
 * Every image and video on the site is a row here — pages reference it, they
 * never carry their own copy. Payload generates the responsive derivatives with
 * sharp on upload, so a 40 MP photograph uploaded from Lightroom is never what
 * the browser downloads.
 *
 * Storage is swappable without touching this file: local disk by default, S3
 * compatible (R2, B2, S3) when the env vars are set. See payload.config.ts.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Media",
    defaultColumns: ["filename", "alt", "mimeType", "filesize", "updatedAt"],
    description: "Images and video. Upload once, reference anywhere.",
  },
  access: {
    read: anyone,
    create: ownerOnly,
    update: ownerOnly,
    delete: ownerOnly,
  },
  upload: {
    // Derivatives are generated once, on upload. `withoutEnlargement` means a
    // small source is never upscaled into a blurry "large".
    imageSizes: [
      { name: "thumbnail", width: 400, height: undefined, position: "centre" },
      { name: "small", width: 800, height: undefined },
      { name: "medium", width: 1400, height: undefined },
      { name: "large", width: 2000, height: undefined },
      { name: "xlarge", width: 2800, height: undefined },
    ],
    formatOptions: {
      format: "webp",
      options: { quality: 82 },
    },
    resizeOptions: { withoutEnlargement: true },
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "video/mp4", "video/webm", "video/quicktime"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "What the image shows, for screen readers and for when it fails to load. Required — the site will not ship an image without it.",
      },
    },
    { name: "caption", type: "text", admin: { description: "Optional. Shown under the media." } },
    { name: "credit", type: "text" },
    {
      name: "kind",
      type: "select",
      defaultValue: "image",
      options: [
        { value: "image", label: "Image" },
        { value: "video", label: "Video" },
      ],
      admin: { description: "Set automatically on upload; change only if it guesses wrong." },
    },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      admin: { description: "Free-form, for searching the library." },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Classify on the way in so the library can be filtered by type.
        if (typeof data?.mimeType === "string") {
          data.kind = data.mimeType.startsWith("video/") ? "video" : "image";
        }
        return data;
      },
    ],
  },
};
