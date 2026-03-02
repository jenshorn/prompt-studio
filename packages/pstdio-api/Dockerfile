FROM oven/bun:1.3.10

WORKDIR /app

# Copy dependency manifests first for a cacheable, reproducible install layer.
COPY package.json bun.lock ./
COPY packages/api/package.json packages/api/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/e2e/package.json packages/e2e/package.json
COPY packages/sync/package.json packages/sync/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY webapps/dashboard/package.json webapps/dashboard/package.json
COPY webapps/desktop/package.json webapps/desktop/package.json
COPY webapps/documentation/package.json webapps/documentation/package.json
COPY webapps/landing-page/package.json webapps/landing-page/package.json

RUN bun install --frozen-lockfile --ignore-scripts \
  --filter './' \
  --filter './packages/api' \
  --filter './packages/db' \
  --filter './packages/sync'

# Copy source after install so code changes do not bust the dependency cache.
COPY tsconfig.base.json ./
COPY packages/api packages/api
COPY packages/db packages/db
COPY packages/sync packages/sync

WORKDIR /app/packages/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
