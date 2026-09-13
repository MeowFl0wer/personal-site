"use client";

import { useEffect, useRef } from "react";

/**
 * What this copy of the site is, said before anything else.
 *
 * The photographs are real and are the author's own. Everything written around
 * them — the biography, the employers, the captions under the pictures — was
 * generated to fill the layout, and a portfolio that looks like a person's
 * life while being invented is worth one sentence of warning before it is
 * read, not a footnote after.
 *
 * Shown once per browser. A notice that returns on every page is one that gets
 * dismissed without reading, which defeats the point of putting it there.
 */
const SEEN = "demo-notice-seen";
const DIALOG_ID = "demo-notice";

export function DemoNotice() {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN) === "1";
    } catch {
      // Blocked storage: show it. Once too often beats never.
    }
    if (seen) return;

    const element = document.getElementById(DIALOG_ID);
    if (element instanceof HTMLDialogElement && !element.open) element.showModal();
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(SEEN, "1");
    } catch {
      // Nothing to do; it will appear again next time.
    }
    const element = document.getElementById(DIALOG_ID);
    if (element instanceof HTMLDialogElement) element.close();
  };

  return (
    <dialog
      id={DIALOG_ID}
      data-print="hide"
      className={[
        "bg-paper text-ink m-auto w-[min(32rem,calc(100vw-2rem))] rounded-[10px] p-0",
        "shadow-[0_1px_2px_rgb(20_26_22/0.10),0_24px_60px_-24px_rgb(20_26_22/0.45)]",
        "ring-1 ring-white/60 backdrop:bg-ink/30 backdrop:backdrop-blur-[2px]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="meta text-muted">Demo · 项目演示</p>
        <DemoNoticeText />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="text-small border-ink hover:bg-ink hover:text-paper border px-4 py-1.5 transition-colors duration-[--duration-fast]"
          >
            Got it · 知道了
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * The words themselves, shared with the foot of the home page.
 *
 * Someone who dismissed the notice, or who arrived by a link straight past it,
 * should still be able to find out what they are looking at.
 */
export function DemoNoticeText() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-small max-w-[58ch]">
        This is a demonstration of the project. The photographs are the author&rsquo;s own — taken,
        edited and uploaded by hand. Everything written around them, including the captions under
        the pictures, was generated to fill the layout and describes nobody.
      </p>
      <p className="text-small text-muted max-w-[58ch]">
        本站为项目演示。图片均为作者本人拍摄、制作并上传；除此之外的全部内容——包括图片的说明文字——
        均由 AI 生成用于填充版面，不指向任何真实的人或经历。
      </p>
    </div>
  );
}
