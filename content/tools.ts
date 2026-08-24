import type { BuiltTool, ToolGroup } from "./types";

/** Things I've built. Hover preview reuses the same component as /work. */
export const builtTools: BuiltTool[] = [
  {
    id: "tool-one",
    name: "Tool One",
    description: "A small command-line tool for reshaping image sets before they go on the web.",
    stack: ["Rust", "WebAssembly"],
    links: [
      { label: "GitHub", href: "https://github.com", external: true },
      { label: "Demo", href: "https://example.com", external: true },
    ],
    preview: {
      src: "/placeholder/tools/tool-one.jpg",
      alt: "Placeholder screenshot of Tool One",
      width: 1400,
      height: 900,
    },
  },
  {
    id: "tool-two",
    name: "Tool Two",
    description: "A browser extension that strips tracking parameters from links before you share them.",
    stack: ["TypeScript", "WebExtensions"],
    links: [{ label: "GitHub", href: "https://github.com", external: true }],
    preview: {
      src: "/placeholder/tools/tool-two.jpg",
      alt: "Placeholder screenshot of Tool Two",
      width: 1400,
      height: 900,
    },
  },
  {
    id: "tool-three",
    name: "Tool Three",
    description: "A tiny static-site helper that turns a folder of photographs into a captioned gallery.",
    stack: ["TypeScript", "React"],
    links: [
      { label: "GitHub", href: "https://github.com", external: true },
      { label: "Demo", href: "https://example.com", external: true },
    ],
    preview: {
      src: "/placeholder/tools/tool-three.jpg",
      alt: "Placeholder screenshot of Tool Three",
      width: 1400,
      height: 900,
    },
  },
];

/** Everyday stack. Plain grouped lists — no logo wall. */
export const usedTools: ToolGroup[] = [
  {
    category: "Development",
    items: [
      { name: "VS Code", note: "Editor" },
      { name: "GitHub", note: "Everything lives here" },
      { name: "Warp", note: "Terminal" },
      { name: "Docker", note: "Local environments" },
      { name: "Linear", note: "Tracking" },
    ],
  },
  {
    category: "Design",
    items: [
      { name: "Figma", note: "Layout & prototyping" },
      { name: "Lightroom", note: "Photo development" },
      { name: "Blender", note: "Occasional 3D" },
    ],
  },
  {
    category: "Hardware",
    items: [
      { name: "MacBook Pro", note: "14\", M-series" },
      { name: "Placeholder 35mm", note: "Film body" },
      { name: "Placeholder Mirrorless", note: "Digital body" },
      { name: "Headphones", note: "Over-ear, wired" },
    ],
  },
  {
    category: "Elsewhere",
    items: [
      { name: "Obsidian", note: "Notes" },
      { name: "Raycast", note: "Launcher" },
      { name: "Things", note: "Tasks" },
    ],
  },
];

export const toolsIntro = ["Things I build,", "things I use."];
