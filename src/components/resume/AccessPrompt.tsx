import { AccessForm } from "./AccessForm";

/**
 * The prompt at the foot of the record.
 *
 * Where someone ends up after reading the whole page and wondering what the
 * covered parts were. It is also the one that survives with scripting off,
 * when no dialog can open.
 */
export function AccessPrompt({ next = "/about" }: { next?: string }) {
  return (
    <div data-print="hide" className="border-rule flex flex-col gap-3 border-t pt-6">
      <p className="text-small text-muted max-w-[48ch]">
        The covered parts are my name, where I have worked and studied. If I have given you a
        code, it goes here — or click any covered line.
      </p>
      <AccessForm next={next} className="max-w-[26rem]" />
    </div>
  );
}
