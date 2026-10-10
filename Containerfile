# The real site's image: the Next app with Payload inside it, served by
# server.mjs on a Unix socket. Not used by the GitHub Pages preview.
#
# Built on the server by the deploy user with rootless Podman, from a clean
# checkout of one commit:
#
#   podman build \
#     --volume <dir holding a COPY of the production site.db>:/build-data \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://euan.im \
#     -t localhost/personal-site:<commit> -f Containerfile .
#
# Why the database is mounted at build time: the pages are prerendered from the
# CMS while `next build` runs (and kept fresh afterwards by Payload's
# revalidatePath hooks). The copy is mounted for the RUN step only and never
# lands in a layer. PAYLOAD_SECRET at build time is a throwaway — the real one
# is supplied at runtime and is never part of the image.

# node:22-bookworm-slim, pinned by its multi-arch index digest (linux/arm64
# present; Node 22.23.3; recorded 2026-10-10).
ARG NODE_IMAGE=docker.io/library/node@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392

FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG NEXT_PUBLIC_SITE_URL
RUN test -n "$NEXT_PUBLIC_SITE_URL" \
 && test -f /build-data/site.db \
 && NODE_ENV=production \
    DATABASE_URI=file:/build-data/site.db \
    PAYLOAD_SECRET=build-only-never-used-at-runtime \
    NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
    npm run build \
 && npm prune --omit=dev --no-audit --no-fund \
 && rm -rf .next/cache

FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    SOCKET_PATH=/sock/http.sock
# Everything root-owned and read-only to the app, except .next — on-demand
# revalidation writes regenerated pages there — and the three mount points.
COPY --from=build /app /app
RUN chown -R node:node /app/.next \
 && mkdir -p /app/data /app/media /sock \
 && chown node:node /app/data /app/media /sock
USER node
CMD ["node", "server.mjs"]
