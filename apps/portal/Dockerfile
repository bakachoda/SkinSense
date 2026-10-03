# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# Stage 1: Build Next.js application
FROM base AS builder
WORKDIR /app

# Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY apps/portal/package.json apps/portal/
COPY apps/api/package.json apps/api/
COPY apps/mobile/package.json apps/mobile/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy sources
COPY packages/types/ packages/types/
COPY packages/config/ packages/config/
COPY apps/portal/ apps/portal/

# Build shared types then portal
RUN pnpm turbo run build --filter=@skinsense/types --filter=@skinsense/portal

# Stage 2: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
COPY --from=builder /app/apps/portal/public ./apps/portal/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/static ./apps/portal/.next/static

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/portal/server.js"]
