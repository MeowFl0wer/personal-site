import { useSyncExternalStore } from "react";

import { COLLAGE_STORAGE_KEY } from "./collage-types";

/**
 * The chosen arrangement, kept where it actually lives: the browser.
 *
 * An external store rather than component state because that is what it is —
 * the value outlives the component, is written from outside React by the
 * inline script in the layout, and can change in another tab. Reading it
 * through useSyncExternalStore also gives the server render an honest answer
 * ("nothing yet") without a hydration mismatch, which a useState initialiser
 * reaching for localStorage cannot.
 *
 * It deliberately knows nothing about which arrangements exist. Those come
 * from the CMS now and can be renamed, reordered or deleted between one visit
 * and the next; deciding whether a stored id is still real is the reader's
 * job, not the store's.
 */
const listeners = new Set<() => void>();

const read = (): string => {
  try {
    return window.localStorage.getItem(COLLAGE_STORAGE_KEY) ?? "";
  } catch {
    // Private windows and blocked site data both throw. Nothing is stored.
    return "";
  }
};

export const collageStore = {
  subscribe(onChange: () => void) {
    listeners.add(onChange);
    // Another tab writing the same key. Cheap to honour and surprising not to.
    window.addEventListener("storage", onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  },

  get: read,

  /** Nothing is chosen until the client has run. */
  getServerSnapshot: (): string | null => null,

  set(id: string) {
    try {
      window.localStorage.setItem(COLLAGE_STORAGE_KEY, id);
    } catch {
      // The choice will not survive the tab. It still applies to this one.
    }
    for (const listener of listeners) listener();
  },
};

export const useCollageTheme = () =>
  useSyncExternalStore(collageStore.subscribe, collageStore.get, collageStore.getServerSnapshot);
