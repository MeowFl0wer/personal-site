/**
 * Replaces a string with a different one of exactly the same shape.
 *
 * The point is that the page can be rendered by the same components, in the
 * same grid, with the same number of rows and the same line breaks, whether or
 * not the reader is allowed to read it. Nothing about the layout is a special
 * case for being locked — there is no placeholder component, no skeleton, no
 * panel. There is the page, and some of the words in it are not the words.
 *
 * Same length, same word boundaries, same punctuation, digits stay digits and
 * capitals stay capitals. So "Placeholder Studio" becomes another two words of
 * eleven and six letters, and wraps where the real one wrapped.
 *
 * What this leaks is length. A reader can tell that an employer's name is
 * eleven letters. That is the price of the layout being honest, and it is the
 * trade the design is asking for — the alternative is a grey block that tells
 * them nothing and looks like a page that failed to load.
 *
 * The real value never reaches the browser. This runs on the server, before
 * anything is rendered, and what is sent is only ever the substitute.
 */

const VOWELS = "aeiou";
const CONSONANTS = "bcdfghjklmnprstvwy";

/** FNV-1a. Small, stable, and not a security boundary — see below. */
const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/**
 * Seeded from the real string so that the same input always produces the same
 * output — a name that changed between two visits, or between the page and the
 * printed version, would be a tell. The hash is not protecting anything: the
 * substitute is what ships, and it carries no way back to the original beyond
 * its length, which is disclosed anyway.
 */
export const redact = (value: string | null | undefined): string => {
  if (!value) return "";

  let state = hash(value) || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };

  let out = "";
  let alternate = false;

  for (const character of value) {
    if (/\s/.test(character)) {
      out += character;
      alternate = false;
      continue;
    }
    if (/\d/.test(character)) {
      out += String(Math.floor(next() * 10));
      continue;
    }
    if (!/[a-z]/i.test(character)) {
      // Punctuation, dashes, anything else: keep it exactly where it was.
      out += character;
      continue;
    }

    /* Alternating vowels and consonants gives word-shaped runs rather than
       the dense ragged blocks a uniform alphabet produces, which is what
       makes a blurred line read as language. */
    const pool = alternate ? VOWELS : CONSONANTS;
    alternate = !alternate;
    const letter = pool[Math.floor(next() * pool.length)];
    out += character === character.toUpperCase() ? letter.toUpperCase() : letter;
  }

  return out;
};

/** For the arrays the resume is mostly made of. */
export const redactAll = (values: (string | null | undefined)[] | null | undefined): string[] =>
  (values ?? []).map((value) => redact(value));
