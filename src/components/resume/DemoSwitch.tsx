"use client";

import { useSyncExternalStore } from "react";

/**
 * The explanation, and the switch.
 *
 * This is the one part of the site that exists to be read about rather than
 * used, so it says what it is doing and then lets someone do it. Turning it on
 * covers the same passages the real site withholds — except that here nothing
 * is withheld, because the demonstration's writing is invented, and saying so
 * is the difference between a demonstration and a lie.
 *
 * The state is an attribute on <html>, which is what the stylesheet reads. No
 * server is involved, and there could not be: this ships as a folder of files.
 */
const KEY = "demo-mask";
const listeners = new Set<() => void>();

const read = () => {
  if (typeof document === "undefined") return "off";
  return document.documentElement.dataset.demoMask === "on" ? "on" : "off";
};

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

const set = (value: "on" | "off") => {
  document.documentElement.dataset.demoMask = value;
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Private windows throw. The switch still works for this page.
  }
  for (const listener of listeners) listener();
};

/** The code shown once the switch is on. It is not a secret; it turns it off. */
export const DEMO_CODE = "DEMO-1234";

export function DemoSwitch() {
  const state = useSyncExternalStore(subscribe, read, () => "off");
  const on = state === "on";

  return (
    <section
      data-print="hide"
      className="border-rule flex flex-col gap-4 border-t pt-6"
      aria-labelledby="demo-privacy-heading"
    >
      <div className="flex flex-col gap-2">
        <h2 id="demo-privacy-heading" className="meta text-muted">
          Privacy masking · 隐私遮盖
        </h2>
        <p className="text-small max-w-[62ch]">
          On the real site, the name on my documents and the record of where I have worked and
          studied are not public. A visitor without an access code is not shown them — the words
          are never sent, not hidden with styling — and each covered line can be clicked to ask
          for a code.
        </p>
        <p className="text-small text-muted max-w-[62ch]">
          正式站上，证件姓名和工作、教育经历不公开。没有授权码的访客拿到的页面里根本没有那些文字，
          而不是用样式盖住。这里是演示，内容本就是虚构的，所以做成一个开关让你自己试。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => set(on ? "off" : "on")}
          aria-pressed={on}
          className="text-small border-ink hover:bg-ink hover:text-paper border px-4 py-1.5 transition-colors duration-[--duration-fast]"
        >
          {on ? "Turn masking off · 关闭遮盖" : "Turn masking on · 开启遮盖"}
        </button>

        {on ? (
          <p className="text-small text-muted">
            Demo code · 演示授权码{" "}
            <code className="text-ink font-mono tracking-[0.14em]">{DEMO_CODE}</code>
          </p>
        ) : null}
      </div>
    </section>
  );
}
