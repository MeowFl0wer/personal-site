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

    /* ------------------------------------------------------------------ */
    /* Everything below the sixth note falls into Earlier posts on /life,  */
    /* and past the eighteenth into the archive. Order here is order there */
    /* — the index reads top to bottom, newest first by convention.        */
    /* ------------------------------------------------------------------ */

    {
      id: "harbour-morning",
      category: "Photography",
      title: "Harbour, before anyone",
      place: "Old Harbour",
      date: "January 2025",
      facts: [{ label: "Time", value: "06:10" }],
      body: "Up early for no reason other than the light. Two boats moving, everything else still.",
      media: [photo("note-01", "Placeholder: boats at first light", 1600, 1067)],
      emphasis: "wide",
    },
    {
      id: "winter-forest",
      category: "Outdoors",
      title: "Snow makes a forest quieter than it should be",
      place: "Northern Woods",
      date: "December 2024",
      facts: [
        { label: "Distance", value: "14 km" },
        { label: "Temp", value: "−9 °C" },
      ],
      body: "The kind of silence that makes your own footsteps sound rude.",
      media: [photo("note-02", "Placeholder: snow between trees", 1200, 1500)],
      emphasis: "inset",
    },
    {
      id: "high-pass",
      category: "Outdoors",
      title: "The pass took four hours longer than the sign said",
      place: "Placeholder Pass",
      date: "September 2024",
      facts: [
        { label: "Distance", value: "31 km" },
        { label: "Ascent", value: "1,640 m" },
        { label: "Time", value: "11h 20m" },
      ],
      body: "The sign was optimistic. So was I. We were both wrong by about the same margin.",
      media: [
        photo("note-03", "Placeholder: a high pass under cloud", 2000, 1250),
        photo("note-11", "Placeholder: the col from below", 1600, 1067),
        photo("ridge-01", "Placeholder: cloud filling the valley", 2000, 1250),
        photo("japan-02", "Placeholder: the sign that lied", 1600, 1100),
      ],
      emphasis: "full",
    },
    {
      id: "market-day",
      category: "Travel",
      title: "Market day",
      place: "Placeholder Town",
      date: "August 2024",
      facts: [{ label: "Bought", value: "Nothing" }],
      body: "Went for produce, left with photographs and no dinner.",
      media: [photo("note-04", "Placeholder: market awnings", 1400, 1000)],
      emphasis: "wide",
    },
    {
      id: "night-train",
      category: "Travel",
      title: "Night train, top bunk",
      place: "Somewhere between",
      date: "July 2024",
      facts: [
        { label: "Hours", value: "11" },
        { label: "Sleep", value: "3" },
      ],
      body: "Slept badly and would do it again immediately.",
      media: [photo("note-05", "Placeholder: a corridor window at night", 1200, 1600)],
      emphasis: "inset",
    },
    {
      id: "long-lens",
      category: "Photography",
      title: "Borrowed a long lens for a week",
      place: "Various",
      date: "June 2024",
      facts: [
        { label: "Lens", value: "180mm" },
        { label: "Keep rate", value: "≈ 1 in 30" },
      ],
      body: "It compresses everything, including my patience. Gave it back on schedule.",
      media: [photo("note-06", "Placeholder: a compressed hillside", 1600, 1100)],
      emphasis: "small",
    },
    {
      id: "riverbank",
      category: "Outdoors",
      title: "Followed the river until it stopped being interesting",
      place: "Lower Valley",
      date: "May 2024",
      facts: [{ label: "Distance", value: "18 km" }],
      body: "Which took considerably longer than expected.",
      media: [photo("note-07", "Placeholder: a river bend", 1400, 1400)],
      emphasis: "wide",
    },
    {
      id: "island-crossing",
      category: "Travel",
      title: "Island crossing",
      place: "Placeholder Sound",
      date: "April 2024",
      facts: [
        { label: "Crossing", value: "90 min" },
        { label: "Sea", value: "Unhelpful" },
      ],
      body: "Stood outside the whole way on the theory that it helps. Unclear whether it does.",
      media: [
        photo("note-08", "Placeholder: a ferry wake", 2000, 1200),
        photo("coast-01", "Placeholder: the far shore", 2000, 1200),
        photo("note-05", "Placeholder: the rail, wet", 1200, 1600),
        photo("ridge-03", "Placeholder: the harbour arriving", 1400, 1000),
        photo("note-14", "Placeholder: gulls, uninterested", 1600, 1100),
      ],
      emphasis: "full",
    },
    {
      id: "rain-city",
      category: "Photography",
      title: "Three days of rain, no complaints",
      place: "Placeholder City",
      date: "March 2024",
      facts: [{ label: "Rolls", value: "4" }],
      body: "Wet pavement does most of the work. I mostly held the camera.",
      media: [photo("note-09", "Placeholder: reflections on wet pavement", 1300, 1000)],
      emphasis: "inset",
    },
    {
      id: "cabin-week",
      category: "Personal",
      title: "A week with no signal",
      place: "Placeholder Cabin",
      date: "February 2024",
      facts: [
        { label: "Days", value: "7" },
        { label: "Books", value: "3" },
      ],
      body: "Read more in a week than in the preceding three months. Draw your own conclusions.",
      media: [photo("note-10", "Placeholder: a cabin window", 1200, 1500)],
      emphasis: "small",
    },
    {
      id: "autumn-ridge",
      category: "Outdoors",
      title: "Autumn on the ridge",
      place: "East Ridge",
      date: "November 2023",
      facts: [
        { label: "Distance", value: "22 km" },
        { label: "Ascent", value: "980 m" },
      ],
      body: "Four seasons before lunch, then none at all for the rest of the day.",
      media: [photo("note-11", "Placeholder: an autumn ridgeline", 1600, 1067)],
      emphasis: "wide",
    },
    {
      id: "old-town",
      category: "Travel",
      title: "Old town, wrong map",
      place: "Placeholder Quarter",
      date: "October 2023",
      facts: [{ label: "Wrong turns", value: "Many" }],
      body: "The map was two renovations out of date, which turned out to be the best thing about it.",
      media: [photo("note-12", "Placeholder: a narrow lane", 1400, 1050)],
      emphasis: "inset",
    },
    {
      id: "first-frost",
      category: "Photography",
      title: "First frost",
      place: "Back field",
      date: "September 2023",
      facts: [{ label: "Frames", value: "11" }],
      body: "Gone by nine. Worth being cold for.",
      media: [photo("note-13", "Placeholder: frost on grass", 1200, 1600)],
      emphasis: "small",
    },
    {
      id: "coastal-path",
      category: "Outdoors",
      title: "The coastal path, in both directions",
      place: "West Coast",
      date: "August 2023",
      facts: [
        { label: "Distance", value: "38 km" },
        { label: "Days", value: "2" },
      ],
      body: "Walked out, camped, walked back. It is a different path on the way home.",
      media: [
        photo("note-14", "Placeholder: a cliff path", 1600, 1100),
        photo("note-01", "Placeholder: the bay from the top", 1600, 1067),
        photo("japan-01", "Placeholder: the camp, first night", 1200, 1600),
        photo("film-01", "Placeholder: the turn-around point", 1400, 1400),
        photo("note-06", "Placeholder: the same path, going back", 1600, 1100),
        photo("note-02", "Placeholder: home, eventually", 1200, 1500),
      ],
      emphasis: "wide",
    },
    {
      id: "borrowed-bike",
      category: "Personal",
      title: "Borrowed bike, unfamiliar hills",
      place: "Placeholder Hills",
      date: "July 2023",
      facts: [
        { label: "Distance", value: "54 km" },
        { label: "Gears", value: "Fewer than needed" },
      ],
      body: "Underestimated the hills and the saddle in roughly equal measure.",
      media: [photo("note-15", "Placeholder: a road over hills", 1500, 1000)],
      emphasis: "inset",
    },
    {
      id: "late-summer",
      category: "Photography",
      title: "Late summer, low sun",
      place: "Various",
      date: "June 2023",
      facts: [{ label: "Stock", value: "200 ISO" }],
      body: "The two weeks when the light does the thinking for you.",
      media: [photo("note-16", "Placeholder: long shadows on a wall", 1200, 1500)],
      emphasis: "small",
    },
  ],
};

/** Notes grouped by category, preserving first-appearance order. */
export const lifeByCategory = life.notes.reduce<Record<string, typeof life.notes>>((acc, note) => {
  (acc[note.category] ??= []).push(note);
  return acc;
}, {});
