import type { LifeContent } from "./types";

const photo = (name: string, alt: string, width = 1600, height = 1100) => ({
  src: `/placeholder/life/${name}.jpg`,
  alt,
  width,
  height,
});

/**
 * Life is field notes, not a hobbies list. Each note carries a place, a date
 * and a few mono facts — the magazine caption, not the caption on a post.
 *
 * `emphasis` is a rhythm hint for the editorial layout:
 *   full  → full-bleed image, its own beat
 *   wide  → wide image, offset text
 *   inset → narrow column, pushed right
 *   small → small plate in a staggered cluster
 */
export const life: LifeContent = {
  intro: ["Away from the screen.", "Places I've been,", "trails I've walked,", "things worth remembering."],
  pillars: ["Hiking", "Photography", "Travel"],
  notes: [
    {
      id: "ridge-traverse",
      category: "Outdoors",
      title: "Mountains are where I go to slow down.",
      place: "Mount Placeholder",
      date: "June 2026",
      facts: [
        { label: "Distance", value: "24 km" },
        { label: "Ascent", value: "1,200 m" },
        { label: "Time", value: "9h 40m" },
      ],
      body: "Started before four to be on the ridge for first light. The last two hours down were entirely in cloud, which I have decided to describe as atmospheric.",
      media: [photo("ridge-01", "Placeholder: a ridge line above cloud at dawn", 2000, 1250)],
      emphasis: "full",
    },
    {
      id: "north-trails",
      category: "Outdoors",
      title: "Long walks, short daylight.",
      place: "Northern Route",
      date: "October 2025",
      facts: [
        { label: "Distance", value: "61 km" },
        { label: "Days", value: "3" },
        { label: "Pack", value: "11.4 kg" },
      ],
      body: "Three days, two huts, and a stove that only worked when held at an angle.",
      media: [
        photo("ridge-02", "Placeholder: a trail marker in low autumn light", 1200, 1500),
        photo("ridge-03", "Placeholder: a hut at the end of a valley", 1400, 1000),
      ],
      emphasis: "wide",
    },
    {
      id: "japan",
      category: "Travel",
      title: "Japan",
      place: "Tokyo · Kanazawa · Kyoto",
      date: "May 2026",
      facts: [
        { label: "Days", value: "16" },
        { label: "Rolls", value: "9" },
        { label: "Trains", value: "Too many" },
      ],
      body: "Mostly walking. The plan was a list of places; what I remember is a list of streets.",
      media: [
        photo("japan-01", "Placeholder: a quiet street at night", 1200, 1600),
        photo("japan-02", "Placeholder: a station platform", 1600, 1100),
        photo("japan-03", "Placeholder: a shopfront in the rain", 1300, 1000),
      ],
      emphasis: "inset",
    },
    {
      id: "coastline",
      category: "Travel",
      title: "Coastline, out of season",
      place: "Atlantic Coast",
      date: "February 2025",
      facts: [
        { label: "Weather", value: "Hostile" },
        { label: "People", value: "None" },
      ],
      body: "Everything closed. Perfect.",
      media: [photo("coast-01", "Placeholder: an empty beach under heavy sky", 2000, 1200)],
      emphasis: "full",
    },
    {
      id: "film",
      category: "Photography",
      title: "Still shooting film, still badly.",
      place: "Various",
      date: "Ongoing",
      facts: [
        { label: "Body", value: "Placeholder 35mm" },
        { label: "Stock", value: "400 ISO, mostly" },
        { label: "Keep rate", value: "≈ 1 in 12" },
      ],
      body: "The delay between taking a photograph and seeing it is the whole point. I keep about one frame in twelve, which feels like an honest ratio.",
      media: [
        photo("film-01", "Placeholder: a contact sheet", 1400, 1400),
        photo("film-02", "Placeholder: a window and a curtain", 1200, 1500),
      ],
      emphasis: "small",
    },
  ],
};

/** Notes grouped by category, preserving first-appearance order. */
export const lifeByCategory = life.notes.reduce<Record<string, typeof life.notes>>((acc, note) => {
  (acc[note.category] ??= []).push(note);
  return acc;
}, {});
