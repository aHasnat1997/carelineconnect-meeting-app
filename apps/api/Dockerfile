FROM oven/bun:1 as builder
WORKDIR /app

COPY package.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/ui/package.json ./apps/ui/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/

RUN bun install

COPY . .

WORKDIR /app/packages/db
RUN bun run generate

WORKDIR /app/apps/api
RUN bun run build

FROM oven/bun:1-slim as runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/api ./apps/api

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["bun", "run", "start"]
