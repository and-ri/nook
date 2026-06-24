# Subscree

Track and manage all your subscriptions in one place.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)

## Features

- Track subscriptions with billing cycle, status, amount, and currency
- Monthly spend overview with upcoming renewal alerts
- Group subscriptions by categories and payment methods
- Multi-currency support with preferred currency for reports
- Light / dark / system theme
- English and Ukrainian localization
- Fully self-hostable via Docker Compose

## Tech stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui     |
| Backend  | Node.js, Express, Prisma ORM, Zod       |
| Database | PostgreSQL 17                           |
| Auth     | JWT (jose)                              |
| Deploy   | Docker Compose, GitHub Actions → GHCR   |

## Getting started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run locally

1. Clone the repo:

   ```bash
   git clone https://github.com/and-ri/subscree.git
   cd subscree
   ```

2. Create a `.env` file in the project root:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set a strong `JWT_SECRET` (min 32 characters):

   ```
   JWT_SECRET=replace_with_a_long_random_string
   ```

3. Start all services:

   ```bash
   docker compose up -d
   ```

4. Open [http://localhost:3001](http://localhost:3001).

The database schema is applied automatically on first start.

### Development (without Docker)

**Server**

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
pnpm install
npx prisma migrate dev
pnpm dev
```

**Web**

```bash
cd web
cp .env.example .env   # set NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
pnpm install
pnpm dev
```

## Deployment

The included GitHub Actions workflow (`.github/workflows/docker.yml`) builds and pushes Docker images to GHCR on every push to `main`.

Before deploying to a remote server, set the following in your GitHub repository under **Settings → Variables → Actions**:

| Variable                    | Description                             |
|-----------------------------|-----------------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`  | Public URL of the API, e.g. `https://api.example.com` |

On the server, pull the images and provide a `.env` with:

```
JWT_SECRET=...
POSTGRES_PASSWORD=...   # if you override the compose default
```

## Environment variables

### Root `.env` (used by Docker Compose)

| Variable       | Required | Description                    |
|----------------|----------|--------------------------------|
| `JWT_SECRET`   | Yes      | Min 32-char secret for JWT signing |

### Server `.env`

| Variable        | Required | Description                        |
|-----------------|----------|------------------------------------|
| `DATABASE_URL`  | Yes      | PostgreSQL connection string       |
| `JWT_SECRET`    | Yes      | Must match the root value          |
| `ORIGIN_URL`    | Yes      | Frontend origin for CORS           |
| `PORT`          | No       | Server port (default `3000`)       |

### Web `.env`

| Variable                   | Required | Description                |
|----------------------------|----------|----------------------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes      | Backend URL seen by the browser |

## License

MIT
