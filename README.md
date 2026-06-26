<div align="center">

# Subscree

### Every subscription. One clear picture.

Stop guessing where your money goes. Subscree tracks every recurring payment, shows your real monthly spend, and reminds you before each renewal — so you never pay for something you forgot you had.

[**Live app →**](https://subscree.app) &nbsp;·&nbsp; [Privacy](https://subscree.app/privacy) &nbsp;·&nbsp; [Terms](https://subscree.app/terms)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/self--hostable-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-MIT-black)

![Subscree dashboard](web/public/screenshots/subscree.app_dashboard.png)

</div>

## Why Subscree

The average person juggles a dozen subscriptions across cards, currencies, and free trials that quietly turn into charges. Subscree pulls all of it into one place so you can see the total, spot the waste, and cancel with confidence.

- **📊 Your true monthly spend** — every plan normalized to a monthly figure, across any mix of currencies.
- **🔔 Never miss a renewal** — see what's billing in the next 30 days and get reminded before a trial turns into a charge.
- **🗂️ Organized your way** — group subscriptions by category and payment method, and filter to exactly what you want to see.
- **👥 Share with your team or family** — invite others to a shared workspace where everyone sees the same subscriptions.
- **💱 Multi-currency** — track plans in their native currency and report in your preferred one.
- **🌗 Yours to keep** — light / dark themes, English & Ukrainian, and a mobile app for tracking on the go.
- **🔓 Open source & self-hostable** — own your data; run the whole thing with one `docker compose up`.

## Take a look

### See where every dollar goes

Clear totals up top, every subscription as a card — amount, billing cycle, status, payment method, and category at a glance.

![Reports overview](web/public/screenshots/subscree.app_dashboard_reports.png)

### Understand your spending at a glance

Break spend down by status, category, and billing cycle — and see your upcoming renewals lined up.

![Detailed reports and charts](web/public/screenshots/subscree.app_reports_detailed.png)

### Track together

Create a shared workspace for your family or team. Invite by email — everyone sees the same subscriptions, categories, and payment methods.

![Team sharing](web/public/screenshots/subscree.app_team.png)

### Take it with you

A native mobile app keeps your subscriptions and renewal reminders in your pocket.

<p align="center">
  <img src="web/public/screenshots/subscree.app_dashboard_mobile.png" alt="Mobile app" width="320">
</p>

## Self-hosting

Subscree is fully self-hostable. The only thing you need is Docker.

```bash
git clone https://github.com/subscree/subscree.git
cd subscree
cp .env.example .env          # then set a strong JWT_SECRET (32+ chars)
docker compose up -d
```

Open [http://localhost:3001](http://localhost:3001) — the database schema is applied automatically on first start.

<details>
<summary><strong>Development (without Docker)</strong></summary>

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

</details>

<details>
<summary><strong>Deployment & environment variables</strong></summary>

### Deployment

The GitHub Actions workflow (`.github/workflows/docker.yml`) builds and pushes Docker images to GHCR on every push to `main`.

Before deploying, set the following in your GitHub repository under **Settings → Variables → Actions**:

| Variable                    | Description                                           |
|-----------------------------|-------------------------------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`  | Public URL of the API, e.g. `https://api.example.com` |

On the server, pull the images and provide a `.env` with `JWT_SECRET` (and `POSTGRES_PASSWORD` if you override the compose default).

### Root `.env` (Docker Compose)

| Variable       | Required | Description                         |
|----------------|----------|-------------------------------------|
| `JWT_SECRET`   | Yes      | Min 32-char secret for JWT signing  |

### Server `.env`

| Variable        | Required | Description                    |
|-----------------|----------|--------------------------------|
| `DATABASE_URL`  | Yes      | PostgreSQL connection string   |
| `JWT_SECRET`    | Yes      | Must match the root value      |
| `ORIGIN_URL`    | Yes      | Frontend origin for CORS       |
| `PORT`          | No       | Server port (default `3000`)   |

### Web `.env`

| Variable                   | Required | Description                     |
|----------------------------|----------|---------------------------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes      | Backend URL seen by the browser |
| `UMAMI_SCRIPT_URL`         | No       | Umami analytics script URL      |
| `UMAMI_WEBSITE_ID`         | No       | Umami website ID                |
| `GA_MEASUREMENT_ID`        | No       | Google Analytics 4 measurement ID |

</details>

## Tech stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui   |
| Mobile   | React Native (Expo)                   |
| Backend  | Node.js, Express, Prisma ORM, Zod     |
| Database | PostgreSQL 17                         |
| Auth     | JWT (jose)                            |
| Deploy   | Docker Compose, GitHub Actions → GHCR |

## License

[MIT](LICENSE)
