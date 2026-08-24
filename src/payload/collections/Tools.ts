import type { CollectionConfig } from "payload";
import { anyone, ownerOnly } from "../access";
import { revalidateAlways } from "../hooks/revalidate";

/** Things I've built. Reuses the site's shared hover-preview component. */
export const BuiltTools: CollectionConfig = {
  slug: "built-tools",
  labels: { singular: "Built Tool", plural: "Tools — Built" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "stack", "featured"],
    description: "Drag to reorder. Shown under BUILT on /tools.",
  },
  access: { read: anyone, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  defaultSort: "order",
  orderable: true,
  hooks: {
    afterChange: [revalidateAlways(["/", "/tools"])],
    afterDelete: [revalidateAlways(["/", "/tools"])],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "stack", type: "text", hasMany: true },
    {
      type: "row",
      fields: [
        { name: "website", type: "text", admin: { width: "50%" } },
        { name: "github", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "screenshot", type: "upload", relationTo: "media", admin: { width: "50%" } },
        { name: "video", type: "upload", relationTo: "media", admin: { width: "50%" } },
      ],
    },
    { name: "featured", type: "checkbox", defaultValue: false },
  ],
};

/** Everyday stack. Plain grouped lists — no logo wall, by design. */
export const UsedTools: CollectionConfig = {
  slug: "used-tools",
  labels: { singular: "Used Tool", plural: "Tools — Use" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "note"],
    description: "Drag to reorder within a category. Shown under USE on /tools.",
  },
  access: { read: anyone, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  defaultSort: "order",
  orderable: true,
  hooks: {
    afterChange: [revalidateAlways(["/", "/tools"])],
    afterDelete: [revalidateAlways(["/", "/tools"])],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "50%" } },
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "development",
          admin: { width: "50%" },
          options: [
            { value: "development", label: "Development" },
            { value: "design", label: "Design" },
            { value: "hardware", label: "Hardware" },
            { value: "photography", label: "Photography" },
            { value: "other", label: "Elsewhere" },
          ],
        },
      ],
    },
    { name: "note", type: "text", admin: { description: "One short line, e.g. “Editor”." } },
    { name: "url", type: "text" },
  ],
};
