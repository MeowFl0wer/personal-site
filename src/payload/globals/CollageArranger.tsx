"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAllFormFields, useConfig, useForm } from "@payloadcms/ui";
import type { UIFieldClientProps } from "payload";

/**
 * Drag the cut-outs around instead of typing percentages at them.
 *
 * Placed inside each arrangement, above the list of pieces. It reads and
 * writes the very same fields that list shows — there is no second copy of the
 * positions — so the numbers move while you drag and typing into them moves
 * the piece. Either is a legitimate way to work: dragging gets you close,
 * typing gets you exact.
 *
 * Held to the same aspect as the real card, in percentages of it, so what is
 * arranged here is what ships. It cannot show the ground wash behind the card
 * the way the site does, which is the one thing it is not honest about.
 */

type Piece = { index: number; x: number; y: number; width: number; rotate: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 10) / 10;

export function CollageArranger({ path }: UIFieldClientProps) {
  const [fields, dispatch] = useAllFormFields();
  const { setModified } = useForm();
  const { config } = useConfig();
  const surface = useRef<HTMLDivElement>(null);

  /* `path` is the UI field's own — themes.0.arrange. Everything this reads and
     writes hangs off the row it sits in. */
  const row = path.replace(/\.arrange$/, "");

  const cardId = fields[`${row}.card`]?.value;

  const pieces = useMemo<Piece[]>(() => {
    const found: Piece[] = [];
    for (let index = 0; ; index += 1) {
      const image = fields[`${row}.pieces.${index}.image`];
      if (!image) break;
      found.push({
        index,
        x: Number(fields[`${row}.pieces.${index}.x`]?.value ?? 0),
        y: Number(fields[`${row}.pieces.${index}.y`]?.value ?? 0),
        width: Number(fields[`${row}.pieces.${index}.width`]?.value ?? 30),
        rotate: Number(fields[`${row}.pieces.${index}.rotate`]?.value ?? 0),
      });
    }
    return found;
  }, [fields, row]);

  const imageIds = useMemo(
    () =>
      pieces
        .map((piece) => fields[`${row}.pieces.${piece.index}.image`]?.value)
        .filter(Boolean) as (string | number)[],
    [fields, pieces, row],
  );

  /* Upload fields hold an id, not a document, so the previews have to be
     fetched. Keyed by id and never evicted: a handful of thumbnails, and the
     alternative is re-fetching on every drag frame. */
  const [urls, setUrls] = useState<Record<string, string>>({});
  const api = `${config.serverURL ?? ""}${config.routes?.api ?? "/api"}`;

  useEffect(() => {
    const wanted = [cardId, ...imageIds].filter(Boolean) as (string | number)[];
    const missing = wanted.filter((id) => !(String(id) in urls));
    if (!missing.length) return;

    let cancelled = false;
    void Promise.all(
      missing.map(async (id) => {
        try {
          const response = await fetch(`${api}/media/${id}?depth=0`, { credentials: "include" });
          if (!response.ok) return null;
          const doc = (await response.json()) as { url?: string };
          return doc.url ? ([String(id), doc.url] as const) : null;
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      const next = Object.fromEntries(entries.filter(Boolean) as (readonly [string, string])[]);
      if (Object.keys(next).length) setUrls((current) => ({ ...current, ...next }));
    });

    return () => {
      cancelled = true;
    };
  }, [api, cardId, imageIds, urls]);

  const write = useCallback(
    (index: number, key: "x" | "y" | "width" | "rotate", value: number) => {
      dispatch({ type: "UPDATE", path: `${row}.pieces.${index}.${key}`, value });
      setModified(true);
    },
    [dispatch, row, setModified],
  );

  const [dragging, setDragging] = useState<number | null>(null);
  const [sizing, setSizing] = useState<number | null>(null);

  const startMove = (piece: Piece) => (event: React.PointerEvent) => {
    const box = surface.current?.getBoundingClientRect();
    if (!box) return;

    event.preventDefault();
    (event.target as Element).setPointerCapture(event.pointerId);
    setDragging(piece.index);

    /* Grab offset, so the piece does not jump its own top-left corner to the
       cursor the moment it is touched. */
    const grabX = ((event.clientX - box.left) / box.width) * 100 - piece.x;
    const grabY = ((event.clientY - box.top) / box.height) * 100 - piece.y;

    const move = (moveEvent: PointerEvent) => {
      const current = surface.current?.getBoundingClientRect();
      if (!current) return;
      const x = ((moveEvent.clientX - current.left) / current.width) * 100 - grabX;
      const y = ((moveEvent.clientY - current.top) / current.height) * 100 - grabY;
      // A piece may hang off the card, but not so far that it is lost.
      write(piece.index, "x", round(clamp(x, -40, 120)));
      write(piece.index, "y", round(clamp(y, -40, 120)));
    };

    const up = () => {
      setDragging(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  /**
   * Scale about the centre, not the corner.
   *
   * The stored position is a top-left corner, so growing a piece without
   * moving it means writing a new corner every frame. Doing that arithmetic
   * here is the whole point of the handle: the alternative is watching a
   * sticker crawl down and to the right as you enlarge it and then dragging it
   * back, which is what this replaces.
   *
   * Scale comes from how far the pointer is from the centre rather than from
   * how far it has travelled, so the piece follows the cursor instead of
   * drifting away from it, and the rotation can be ignored — a rotation about
   * the centre leaves the centre where it was.
   */
  const startResize = (piece: Piece) => (event: React.PointerEvent) => {
    const box = surface.current?.getBoundingClientRect();
    const element = (event.currentTarget as HTMLElement).closest<HTMLElement>("[data-piece]");
    const image = element?.querySelector("img");
    if (!box || !element || !image) return;

    event.preventDefault();
    event.stopPropagation();
    setSizing(piece.index);

    const start = element.getBoundingClientRect();
    const centreX = start.left + start.width / 2;
    const centreY = start.top + start.height / 2;
    const reach = Math.hypot(event.clientX - centreX, event.clientY - centreY);
    const ratio = image.naturalHeight / (image.naturalWidth || 1);
    // A pointer that starts on top of the centre would divide by nothing.
    if (reach < 4) return;

    const move = (moveEvent: PointerEvent) => {
      const current = surface.current?.getBoundingClientRect();
      if (!current) return;

      const distance = Math.hypot(moveEvent.clientX - centreX, moveEvent.clientY - centreY);
      const width = clamp((piece.width * distance) / reach, 4, 140);

      // Put the corner back where it has to be for the centre not to have moved.
      const pixelWidth = (width / 100) * current.width;
      const pixelHeight = pixelWidth * ratio;
      const x = ((centreX - current.left - pixelWidth / 2) / current.width) * 100;
      const y = ((centreY - current.top - pixelHeight / 2) / current.height) * 100;

      write(piece.index, "width", round(width));
      write(piece.index, "x", round(clamp(x, -40, 120)));
      write(piece.index, "y", round(clamp(y, -40, 120)));
    };

    const up = () => {
      setSizing(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const cardUrl = cardId ? urls[String(cardId)] : undefined;

  return (
    <div className="field-type" style={{ marginBottom: "1.5rem" }}>
      <div className="field-label" style={{ marginBottom: ".4rem" }}>
        Arrange
      </div>
      <p style={{ margin: "0 0 .75rem", fontSize: ".8rem", opacity: 0.7, maxWidth: "42rem" }}>
        Drag a cut-out to move it, or its corner handle to resize it — always in proportion, and
        about its own centre, so it grows where it stands. The numbers below follow, and typing into
        them moves the piece: use the list for anything that has to be exact. Rotation stays in the
        list, being fiddly to drag and easy to type.
      </p>

      <div
        ref={surface}
        style={{
          position: "relative",
          width: "min(22rem, 100%)",
          aspectRatio: "4 / 5",
          background: cardUrl ? undefined : "repeating-conic-gradient(#0001 0% 25%, transparent 0% 50%) 50% / 16px 16px",
          border: "1px solid var(--theme-elevation-150)",
          borderRadius: "2px",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {cardUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cardUrl}
            alt=""
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <p style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: ".8rem", opacity: 0.6 }}>
            Choose a card to arrange on
          </p>
        )}

        {pieces.map((piece) => {
          const id = fields[`${row}.pieces.${piece.index}.image`]?.value;
          const url = id ? urls[String(id)] : undefined;
          if (!url) return null;
          const active = dragging === piece.index || sizing === piece.index;
          return (
            <div
              key={piece.index}
              data-piece={piece.index}
              style={{
                position: "absolute",
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                width: `${piece.width}%`,
                transform: `rotate(${piece.rotate}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                draggable={false}
                onPointerDown={startMove(piece)}
                title={`Cut-out ${piece.index + 1} — drag to move`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  cursor: dragging === piece.index ? "grabbing" : "grab",
                  filter: active
                    ? "drop-shadow(0 6px 10px rgba(0,0,0,.35))"
                    : "drop-shadow(0 3px 5px rgba(0,0,0,.2))",
                }}
              />
              <button
                type="button"
                onPointerDown={startResize(piece)}
                title={`Cut-out ${piece.index + 1} — drag to resize`}
                aria-hidden="true"
                /* Out of the tab order on purpose: a pointer-only control with
                   no keyboard behaviour should not be a stop, and the Width
                   field below does the same job for anyone typing. */
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: "-7px",
                  bottom: "-7px",
                  width: "14px",
                  height: "14px",
                  padding: 0,
                  borderRadius: "50%",
                  border: "1.5px solid var(--theme-elevation-0, #fff)",
                  background: "var(--theme-elevation-800, #333)",
                  boxShadow: "0 1px 3px rgba(0,0,0,.4)",
                  opacity: active ? 1 : 0.55,
                  cursor: "nwse-resize",
                  touchAction: "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
