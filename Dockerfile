# Stage 1: dependencies
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm i --frozen-lockfile

# Stage 2: builder
FROM node:22-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# No build-time environment. Every value the browser may see is serialized at
# request time by EnvScript, which is what lets one image serve staging and
# production — see .claude/docs/DEPLOYMENT.md.
RUN --mount=type=cache,target=/app/.next/cache \
    pnpm exec next build

# Stage 3: runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 -G nodejs nextjs

# `output: "standalone"` in next.config.ts bundles the server and only the
# modules it reaches, so this stage carries no node_modules of its own.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# /api/health is served by this app's own Hono proxy and reaches no backend, so
# a healthy answer here means the web container is up — not that the API is.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD ["node", "server.js"]
