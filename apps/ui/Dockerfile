FROM oven/bun:1 as builder
WORKDIR /app

COPY package.json tsconfig.json ./
COPY apps/ui/package.json ./apps/ui/
COPY packages/types/package.json ./packages/types/

RUN bun install

COPY . .

WORKDIR /app/apps/ui
RUN bun run build

FROM nginx:alpine as runner
COPY --from=builder /app/apps/ui/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
