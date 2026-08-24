import type { CollectionConfig } from "payload";
import { anyone, ownerOnly } from "../access";
import { revalidateAlways } from "../hooks/revalidate";

/**
 * Gallery — the photographs behind the 3D ring.
 *
 * `orderable: true` gives drag-and-drop ordering in the admin list view, and the
 * ring simply reads that order. The admin never touches a Three.js parameter:
 * it controls data, sequence and metadata, and the scene decides what to do
 * with them. That separation is the whole point.
 */
export const Gallery: CollectionConfig = {
  slug: "gallery",
  labels: { singular: "Photograph", plural: "Gallery" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["image", "title", "place", "date", "featured"],
    description: "Drag rows to set the order the ring turns through.",
  },
  access: { read: anyone, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  defaultSort: "order",
  orderable: true,
  hooks: {
    // Reordering here is what the 3D ring reads, so the page must be rebuilt.
    afterChange: [revalidateAlways(["/gallery", "/life"])],
    afterDelete: [revalidateAlways(["/gallery", "/life"])],
  },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "Pick from the Media Library, or upload here." },
    },
    {
      type: "row",
      fields: [
        { name: "title", type: "text", admin: { width: "50%" } },
        { name: "place", type: "text", required: true, admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "date", type: "text", required: true, admin: { width: "50%", description: 'e.g. "May 2026"' } },
        { name: "featured", type: "checkbox", defaultValue: false, admin: { width: "50%" } },
      ],
    },
    { name: "caption", type: "text" },
    {
      type: "collapsible",
      label: "Camera",
      admin: { initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "camera", type: "text", admin: { width: "33%" } },
            { name: "lens", type: "text", admin: { width: "33%" } },
            { name: "focalLength", type: "text", admin: { width: "34%" } },
          ],
        },
      ],
    },
    { name: "tags", type: "text", hasMany: true },
  ],
};
