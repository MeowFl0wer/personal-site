/**
 * What each original file actually contains.
 *
 * The artwork arrives as `ChatGPT Image <timestamp> (n).png`, which says
 * nothing, so the table is by hand and by eye. Shared because two scripts need
 * it: the importer to name what it writes, and the exporter to recognise the
 * same picture arriving a second time — uploading one through the admin keeps
 * the original name, and without this the repository would end up holding both
 * copies under different names.
 *
 * Re-exporting the folder changes every timestamp and this has to be redone.
 * If that happens twice, rename the sources instead.
 */
/* Every cut-out ships, not just the sixteen the four starting arrangements
   use — the whole point of moving this into the CMS is being able to reach for
   one that is not on the page yet. Named by eye, because the originals arrive
   as `ChatGPT Image <timestamp> (n).png`; re-exporting the folder changes the
   timestamps and this table has to be redone. */
const NAMES = {
  "ChatGPT Image Sep 10, 2026, 11_49_31 AM (1).png": "pair-ridges",
  "ChatGPT Image Sep 10, 2026, 11_49_31 AM (2).png": "pair-hills",
  "ChatGPT Image Sep 10, 2026, 11_49_32 AM (3).png": "pair-yaks",
  "ChatGPT Image Sep 10, 2026, 11_58_46 AM (1).png": "card-ridges",
  "ChatGPT Image Sep 10, 2026, 11_58_46 AM (2).png": "card-hills",
  "ChatGPT Image Sep 10, 2026, 11_58_47 AM (3).png": "card-yaks",
  "ChatGPT Image Sep 10, 2026, 12_08_32 PM (1).png": "pair-reeds",
  "ChatGPT Image Sep 10, 2026, 12_08_33 PM (2).png": "card-reeds",
  "ChatGPT Image Sep 10, 2026, 12_12_31 PM (1).png": "pair-coast",
  "ChatGPT Image Sep 10, 2026, 12_12_31 PM (2).png": "card-coast",
  "ChatGPT Image Sep 10, 2026, 12_12_32 PM (3).png": "pair-open-sea",
  "ChatGPT Image Sep 10, 2026, 12_12_33 PM (4).png": "card-open-sea",
  "ChatGPT Image Sep 11, 2026, 06_14_34 PM.png": "sheet-into-the-mountains",
  "ChatGPT Image Sep 11, 2026, 06_17_12 PM (1).png": "figure-back",
  "ChatGPT Image Sep 11, 2026, 06_17_13 PM (2).png": "figure-side",
  "ChatGPT Image Sep 11, 2026, 06_17_14 PM (3).png": "figure-front",
  "ChatGPT Image Sep 11, 2026, 06_17_15 PM (4).png": "figure-blue",
  "ChatGPT Image Sep 11, 2026, 06_31_44 PM (1).png": "figure-puffer",
  "ChatGPT Image Sep 11, 2026, 06_31_44 PM (2).png": "figure-striped",
  "ChatGPT Image Sep 11, 2026, 06_31_45 PM (3).png": "figure-neon",
  "ChatGPT Image Sep 11, 2026, 06_31_46 PM (4).png": "figure-mirror",
  "ChatGPT Image Sep 11, 2026, 06_31_46 PM (5).png": "figure-mirror-peace",
  "ChatGPT Image Sep 11, 2026, 06_31_47 PM (6).png": "group-friends",
  "ChatGPT Image Sep 11, 2026, 07_02_36 PM (1).png": "hills-green",
  "ChatGPT Image Sep 11, 2026, 07_02_38 PM (2).png": "pine-tree",
  "ChatGPT Image Sep 11, 2026, 07_02_39 PM (3).png": "reeds-gold",
  "ChatGPT Image Sep 11, 2026, 07_02_40 PM (4).png": "sea-stacks",
  "ChatGPT Image Sep 11, 2026, 07_02_40 PM (5).png": "snow-peak",
  "ChatGPT Image Sep 11, 2026, 07_02_41 PM (6).png": "ridge-red",
  "ChatGPT Image Sep 11, 2026, 07_02_42 PM (7).png": "snow-summit",
  "ChatGPT Image Sep 11, 2026, 07_02_42 PM (8).png": "forest-autumn",
  "ChatGPT Image Sep 11, 2026, 07_02_43 PM (9).png": "pine-branch",
  "ChatGPT Image Sep 11, 2026, 07_02_44 PM (10).png": "sunset-figure",
};

/* A card is opaque and portrait; a cut-out has its own alpha and gets trimmed
   to its content before it is scaled. Deciding by name rather than by probing
   the pixels keeps the output stable. */
const isCard = (name) => name.startsWith("card-") || name.startsWith("pair-");

export { NAMES, isCard };
