# Deployment Readiness

## Hosted database decision

Use **Neon Postgres** for deployed environments. Neon is Postgres-compatible, works well with Vercel, and provides pooled connection strings suitable for serverless runtimes.

Local SQLite is no longer the production assumption. The Prisma datasource is PostgreSQL, so every deployed preview or production environment must provide a Postgres-compatible `DATABASE_URL` before order routes are exercised.

## Environment contract

| Variable | Required for deploy | Visibility | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Yes | Public | Canonical app URL used by redirects, links, and smoke scripts. Use the deployed preview/production URL, not localhost. |
| `DATABASE_URL` | Yes | Secret | Neon pooled Postgres connection string with SSL enabled. Runtime order, payment attempt, and webhook persistence depends on it. |
| `ADMIN_USER` | Yes | Secret | Basic-auth username for `/admin`, `/api/admin`, and `/api/dev`. |
| `ADMIN_PASSWORD` | Yes | Secret | Basic-auth password for admin and dev-operation routes. Use a long random value per environment. |
| `NEXT_PUBLIC_SHOW_OPS_LINK` | Yes | Public | Set to `true` only in internal/staging environments where exposing the header ops link is acceptable. Keep `false` for public production. |
| `MP_ACCESS_TOKEN` | Before real payments | Secret | Mercado Pago API token. Keep unset or empty until the real checkout provider is enabled. |
| `MP_WEBHOOK_SECRET` | Before real payments | Secret | Mercado Pago webhook signature secret. Keep unset or empty until the real webhook endpoint is enabled. |
| `INTERNAL_NOTIFICATION_WEBHOOK_URL` | Optional before notifications | Secret | Internal notification sink for operations alerts once notification delivery is implemented. |

Never commit real secret values. Use `.env.example` only for names, placeholders, and local defaults.

## Neon setup

1. Create a Neon project for the target environment.
2. Create or select the application database.
3. Copy the pooled Postgres connection string.
4. Store that value as `DATABASE_URL` in Vercel project environment variables.
5. Confirm the URL uses SSL, for example `sslmode=require`.

## Local development database

Local development now uses Postgres too. Do not point development at production. Use one of these disposable options:

- a Neon development branch, or
- a local Postgres container.

Example local container:

```bash
docker run --name site-factory-postgres \
  -e POSTGRES_USER=site_factory \
  -e POSTGRES_PASSWORD=site_factory \
  -e POSTGRES_DB=site_factory_dev \
  -p 5432:5432 \
  -d postgres:16
```

Then set local `DATABASE_URL` to:

```bash
DATABASE_URL="postgresql://site_factory:site_factory@localhost:5432/site_factory_dev?schema=public"
```

## Migration instructions

For local development against a disposable Postgres database:

```bash
cp .env.example .env
# Edit DATABASE_URL to point at the disposable Postgres database.
npm run db:generate
npm run db:migrate
```

For deployed preview/production databases:

```bash
npm run db:generate
npm run db:migrate:deploy
```

`db:migrate` is for development migration authoring against a disposable database. `db:migrate:deploy` is the deploy-safe command that applies committed migrations without trying to create a new migration interactively. The committed Postgres baseline migration is `20260629203000_hosted_postgres_baseline`.

## Deploy checklist

Before promoting a preview to production:

- `DATABASE_URL` points to the intended Neon database, not a developer database.
- `NEXT_PUBLIC_BASE_URL` exactly matches the deployed origin.
- `ADMIN_USER` and `ADMIN_PASSWORD` are set for production.
- `NEXT_PUBLIC_SHOW_OPS_LINK=false` for public production.
- `MP_ACCESS_TOKEN` and `MP_WEBHOOK_SECRET` are present only when the real Mercado Pago integration is enabled.
- Prisma migrations have been applied with `npm run db:migrate:deploy`.
- `npm run smoke:deploy` passes against the deployed URL with admin credentials.
- A submitted order remains visible in `/admin/orders` after a redeploy.

## Smoke script behavior

Smoke scripts read `NEXT_PUBLIC_BASE_URL` and default to `http://localhost:3000` when it is unset. For deployed verification, always pass the target URL explicitly:

```bash
NEXT_PUBLIC_BASE_URL="https://your-preview.vercel.app" npm run smoke:m2
```

`smoke:m2` creates a real order through `/api/orders`, fetches it back through `/api/orders/[publicId]`, and prints the admin detail URL. Run it only against environments where creating a test order is acceptable.

For deployed preview/production readiness, run the deploy smoke script with the deployed URL and admin credentials:

```bash
NEXT_PUBLIC_BASE_URL="https://your-preview.vercel.app" \
ADMIN_USER="ops-user" \
ADMIN_PASSWORD="ops-password" \
npm run smoke:deploy
```

The deploy smoke script checks:

- `GET /`
- `GET /templates`
- `GET /templates/psicologo-clinico-agenda`
- `POST /api/orders`
- `GET /admin/orders` with Basic auth credentials


## Production deploy runbook

This PR is the deployment gate for PR 5. Do not enable real Mercado Pago checkout or webhook processing until the Mercado Pago PR is complete.

### 1. Set environment variables

Set these in the Vercel project for the target environment before running migrations or smoke tests:

1. `NEXT_PUBLIC_BASE_URL`: exact deployed origin, for example `https://your-preview.vercel.app`.
2. `DATABASE_URL`: Neon pooled Postgres connection string for that environment with SSL enabled.
3. `ADMIN_USER`: per-environment admin Basic-auth username.
4. `ADMIN_PASSWORD`: long random per-environment admin Basic-auth password.
5. `NEXT_PUBLIC_SHOW_OPS_LINK`: `false` for public production; `true` only for internal previews.
6. `MP_ACCESS_TOKEN`: keep empty until the real Mercado Pago PR is complete.
7. `MP_WEBHOOK_SECRET`: keep empty until the real Mercado Pago PR is complete.
8. `INTERNAL_NOTIFICATION_WEBHOOK_URL`: optional until internal notifications are implemented.

After changing Vercel environment variables, redeploy the preview/production target so the runtime receives the new values.

### 2. Run migrations

Apply committed Prisma migrations against the target hosted database:

```bash
npm run db:generate
npm run db:migrate:deploy
```

Use `npm run db:migrate` only for development migration authoring against a disposable database. Never author migrations against production.

### 3. Smoke test the deploy

Run the deployed smoke check against the target URL:

```bash
NEXT_PUBLIC_BASE_URL="https://your-preview.vercel.app" \
ADMIN_USER="ops-user" \
ADMIN_PASSWORD="ops-password" \
npm run smoke:deploy
```

Acceptance for a deploy preview:

- A real order can be submitted through `POST /api/orders`.
- The order persists in the hosted database.
- Admin can view `/admin/orders` with Basic auth.
- The same order remains visible after a redeploy.

### 4. Roll back

If smoke checks fail after deploy:

1. Stop promotion to production.
2. Revert to the last known-good Vercel deployment.
3. Keep the hosted database intact unless a migration is confirmed to be the cause.
4. If a migration caused the incident, create a forward-fix migration or restore from a Neon backup/branch according to Neon environment policy. Do not edit an already-applied migration in place.
5. Re-run `npm run db:migrate:deploy` and `npm run smoke:deploy` against the rollback/fix target before retrying promotion.

### Known limits

- Real Mercado Pago checkout is intentionally not implemented yet.
- Mercado Pago webhook signature validation and payment reconciliation are intentionally not implemented yet.
- Success, failure, and pending checkout pages must not mark orders as paid.
- Admin protection remains the existing Basic-auth middleware; this PR does not add a new auth system.
- There is no customer dashboard or CMS in this milestone.
- Smoke scripts create test orders, so run them only in environments where test order data is acceptable.

## Admin protection

The middleware protects `/admin/:path*`, `/api/admin/:path*`, and `/api/dev/:path*` with Basic auth when `ADMIN_USER` and `ADMIN_PASSWORD` are configured.

In production, missing admin credentials return `503` instead of allowing access. In local development, missing credentials keep the developer flow frictionless.

Do not use `NEXT_PUBLIC_SHOW_OPS_LINK` as authorization. It only controls whether the public header renders an ops link; Basic auth remains the protection boundary for admin routes.
