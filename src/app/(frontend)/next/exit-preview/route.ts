import { draftMode } from "next/headers";

/** Leaves draft mode. Linked from the preview banner. */
export async function GET() {
  const draft = await draftMode();
  draft.disable();
  return new Response("Preview mode disabled. You are seeing the published site again.");
}
