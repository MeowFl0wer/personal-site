import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { PREVIEW_SECRET } from "@/payload/preview";

/**
 * Draft preview entry point.
 *
 * Two checks, both necessary:
 *   1. the shared secret matches — so the URL cannot be guessed;
 *   2. the caller is actually signed in to the admin — so a leaked preview link
 *      still cannot expose unpublished work to a stranger.
 *
 * After that it turns on Next's draft mode and redirects to the real page. The
 * page renders exactly as it will once published, animations and all, because
 * it *is* the page — there is no separate preview renderer to drift.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path") ?? "/";

  if (secret !== PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  // Only relative paths — an open redirect here would be a real vulnerability.
  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("Invalid preview path", { status: 400 });
  }

  const payload = await getPayload({ config });
  const user = await payload.auth({ headers: request.headers });

  if (!user.user) {
    return new Response("You must be signed in to the admin to preview drafts", { status: 403 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(path);
}
