"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AccessForm } from "./AccessForm";
import { DEMO_CODE } from "./DemoSwitch";

/**
 * The prompt a covered passage opens.
 *
 * A native <dialog>, so the browser handles the backdrop, the focus trap and
 * Escape. With scripting off it never opens, and nothing is lost — the same
 * form stands at the foot of the page.
 */
export const ACCESS_DIALOG_ID = "access-dialog";

/**
 * Reopens the dialog when a code has just been refused.
 *
 * Its own component, and behind its own Suspense boundary, because
 * useSearchParams opts whatever contains it out of the static render — and
 * /about is a page the static export has to be able to prerender. Reading the
 * query anywhere higher takes the whole page down with it, which is exactly
 * what the export reported.
 */
function ReopenOnRefusal() {
  const status = useSearchParams().get("access");
  const reopened = useRef(false);

  useEffect(() => {
    if (!status || reopened.current) return;
    reopened.current = true;
    const element = document.getElementById(ACCESS_DIALOG_ID);
    if (element instanceof HTMLDialogElement && !element.open) element.showModal();
  }, [status]);

  return null;
}

export function AccessDialog({ next = "/about", demo = false }: { next?: string; demo?: boolean }) {
  return (
    <dialog
      id={ACCESS_DIALOG_ID}
      data-print="hide"
      className={[
        "bg-paper text-ink m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[10px] p-0",
        "shadow-[0_1px_2px_rgb(20_26_22/0.10),0_24px_60px_-24px_rgb(20_26_22/0.45)]",
        "ring-1 ring-white/60 backdrop:bg-ink/25 backdrop:backdrop-blur-[2px]",
      ].join(" ")}
    >
      <Suspense fallback={null}>
        <ReopenOnRefusal />
      </Suspense>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <p className="meta text-muted">Private</p>
          <p className="text-small max-w-[34ch]">
            {demo
              ? "A demonstration of the real thing. The code is on the page below."
              : "This part is not public. If I have given you an access code, it goes here."}
          </p>
          {demo ? (
            <p className="text-small text-muted max-w-[34ch]">
              演示：授权码就在下方说明处。
            </p>
          ) : null}
        </div>

        {/* On the demonstration the code cannot be checked — there is no
            server to check it against — so the form is a local one that simply
            turns the switch back off. It is the same shape and the same
            gesture; what it is not is a pretence of security. */}
        <AccessForm
          next={next}
          demoCode={demo ? DEMO_CODE : undefined}
          onCancel={() => {
            const element = document.getElementById(ACCESS_DIALOG_ID);
            if (element instanceof HTMLDialogElement) element.close();
          }}
        />
      </div>
    </dialog>
  );
}
