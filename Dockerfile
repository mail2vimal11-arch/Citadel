# Citadel — production container, deployed behind an existing Traefik proxy.
# Routing/TLS are handled by Traefik via the labels in docker-compose.yml
# (mirrors the host's existing aletheos-website pattern: entrypoint websecure,
# certresolver letsencrypt).

FROM node:20-slim AS base
# Prisma needs OpenSSL on Debian-slim images (build + runtime).
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- dependencies (cached layer) -------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
# `postinstall` runs `prisma generate`, which needs the schema copied above.
RUN npm ci

# ---- build ------------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Hermetic build — no real DB or AI needed. A dummy DATABASE_URL satisfies
# Prisma client init; the heuristic provider avoids any Ollama dependency.
ENV NODE_ENV=production
ENV DATABASE_URL="file:/tmp/build.db"
ENV AI_PROVIDER="heuristic"
RUN mkdir -p public && npx prisma generate && npx next build

# ---- runtime ----------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
# Full node_modules are kept so the Prisma CLI is available to push the schema
# into the data volume at boot, and `next start` can serve the build.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/prisma ./prisma
# Mount points for persistence (declared as volumes in docker-compose.yml).
RUN mkdir -p /app/data /app/.citadel-secrets
EXPOSE 3000
# Create/refresh the SQLite schema in the mounted volume, then serve on 0.0.0.0
# so Traefik (host network) can reach the container's bridge IP.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx next start -H 0.0.0.0 -p 3000"]
