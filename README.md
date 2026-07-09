# CareLineConnect Meeting App

A full-stack meeting management application built on a **Bun monorepo**, integrating Zoom for meeting creation and management. The project features a type-safe tRPC API backed by Express, a React + Vite frontend, and MongoDB via Prisma.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CareLineConnect Meeting App allows users to **create** and **join** Zoom meetings through a clean, modern interface. It is architected as a monorepo to share types and database logic across the frontend and backend, enabling end-to-end type safety with zero boilerplate.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Monorepo (Bun)                     │
│                                                         │
│  ┌─────────────┐        ┌──────────────────────────┐   │
│  │   apps/ui   │◄──────►│       apps/api           │   │
│  │  React/Vite │  tRPC  │  Express + tRPC Server   │   │
│  └─────────────┘        └──────────┬───────────────┘   │
│                                    │                    │
│                         ┌──────────▼───────────────┐   │
│                         │      packages/db          │   │
│                         │  Prisma ORM + MongoDB     │   │
│                         └──────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │               packages/types                     │   │
│  │          Shared Zod Schemas & Types              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer          | Technology                                              |
|----------------|---------------------------------------------------------|
| Runtime        | [Bun](https://bun.sh/) (package manager + runtime)      |
| Frontend       | React 18, Vite 5, TailwindCSS 4                         |
| Backend        | Express 4, [tRPC](https://trpc.io/) v10                 |
| Database       | MongoDB (via Docker), [Prisma](https://prisma.io/) ORM  |
| Validation     | [Zod](https://zod.dev/)                                 |
| Data Fetching  | TanStack Query v4                                       |
| Integration    | Zoom API (Server-to-Server OAuth)                       |
| Language       | TypeScript 5                                            |
| Deployment     | Docker & Docker Compose                                 |

---

## Project Structure

```
meeting-app-test/
├── apps/
│   ├── api/                   # Backend — Express + tRPC server
│   │   └── src/
│   │       ├── index.ts       # App entry point & Express setup
│   │       ├── trpc.ts        # tRPC initialization & context
│   │       └── routers/
│   │           ├── index.ts   # Root application router
│   │           └── meeting.ts # Meeting procedures (create, getById)
│   └── ui/                    # Frontend — React + Vite SPA
│       └── src/
│           ├── main.tsx       # App entry point & providers setup
│           ├── App.tsx        # Root application component
│           └── trpc.ts        # tRPC client configuration
├── packages/
│   ├── db/                    # Shared database layer
│   │   └── prisma/
│   │       └── schema.prisma  # Data models (Host, Meeting)
│   └── types/                 # Shared Zod schemas & TypeScript types
│       └── src/
│           └── index.ts       # CreateMeetingSchema, JoinMeetingSchema, etc.
├── docker-compose.yml         # Orchestrates MongoDB, API, and UI containers
├── .env.example               # Environment variable template
└── package.json               # Monorepo root configuration
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)** `>= 1.0.0`
- **[Docker](https://www.docker.com/)** & **Docker Compose** (for the database)
- A **Zoom Developer Account** with a Server-to-Server OAuth app

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/carelineconnect-meeting-app.git
cd carelineconnect-meeting-app
```

### 2. Install Dependencies

This project uses Bun workspaces. A single command installs all dependencies across all apps and packages.

```bash
bun install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and update the values. See the [Environment Variables](#environment-variables) section for details.

### 4. Start the Database

Spin up a local MongoDB instance using Docker Compose:

```bash
docker compose up -d mongodb
```

### 5. Push the Database Schema

Apply the Prisma schema to your running MongoDB instance:

```bash
bun db:push
```

### 6. Run the Development Servers

Start both the API and UI development servers concurrently:

```bash
bun dev
```

| Service           | URL                            |
|-------------------|--------------------------------|
| UI                | http://localhost:5173          |
| API               | http://localhost:4000          |
| tRPC Endpoint     | http://localhost:4000/trpc     |

---

## Available Scripts

All scripts are run from the **monorepo root**:

| Command           | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| `bun dev`         | Start all apps in development/watch mode                           |
| `bun build`       | Build all apps for production                                      |
| `bun db:generate` | Regenerate the Prisma Client after schema changes                  |
| `bun db:push`     | Push the Prisma schema to the database (no migration files)        |

---

## API Reference

The API uses **tRPC** for end-to-end type safety. All endpoints are available under `/trpc`.

### `meeting.create`

> **Mutation** — Creates a new Zoom meeting and persists it to the database.

**Input:**

| Field       | Type     | Required | Description              |
|-------------|----------|----------|--------------------------|
| `topic`     | `string` | ✅ Yes   | The meeting topic/title  |
| `startTime` | `string` | ❌ No    | ISO 8601 start time      |
| `duration`  | `number` | ❌ No    | Duration in minutes      |

**Returns:** The created `Meeting` object including `id`, `zoomId`, `topic`, and `joinUrl`.

---

### `meeting.getById`

> **Query** — Retrieves a meeting by its internal database ID.

**Input:**

| Field         | Type     | Required | Description                         |
|---------------|----------|----------|-------------------------------------|
| `meetingId`   | `string` | ✅ Yes   | The internal MongoDB meeting ID     |
| `displayName` | `string` | ✅ Yes   | The display name of the participant |

**Returns:** The `Meeting` object, or throws an error if not found.

---

## Docker Deployment

The project includes a full `docker-compose.yml` to run all services in containers.

**Build and start all services:**

```bash
docker compose up --build
```

| Service    | URL / Port             |
|------------|------------------------|
| UI         | http://localhost:3000  |
| API        | http://localhost:4000  |
| MongoDB    | `localhost:27017`      |

> **Note:** Ensure your `.env` file is configured before running with Docker. The `api` container reads environment variables from the Compose file's `environment` section.

---

## Environment Variables

| Variable              | Description                               | Example                                                              |
|-----------------------|-------------------------------------------|----------------------------------------------------------------------|
| `DATABASE_URL`        | MongoDB connection string                 | `mongodb://root:password@localhost:27017/carelineconnect?authSource=admin` |
| `PORT`                | Port the API server listens on            | `4000`                                                               |
| `ZOOM_ACCOUNT_ID`     | Zoom Server-to-Server OAuth Account ID    | `aBcDeFgHiJ`                                                         |
| `ZOOM_CLIENT_ID`      | Zoom OAuth Client ID                      | `xYzAbCdEfG`                                                         |
| `ZOOM_CLIENT_SECRET`  | Zoom OAuth Client Secret                  | `1a2b3c4d5e6f7g8h9i0j`                                               |
| `VITE_API_URL`        | The tRPC API URL consumed by the frontend | `http://localhost:4000/trpc`                                         |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m 'feat: add some feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request** against `main`.

Please ensure your code follows the existing TypeScript conventions and that all packages build without errors (`bun build`) before submitting.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <strong>Hasnat</strong>
</p>
