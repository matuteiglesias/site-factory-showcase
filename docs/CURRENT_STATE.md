# Current State

## Achieved

- Next.js App Router app
- Tailwind-based public UI
- Real catalog with two live demo-based templates
- Template detail pages
- Pedido form
- Prisma + SQLite order persistence
- Orders start as `pending_payment`
- Admin orders list/detail
- Fake checkout and fake webhook flow from Milestone 1
- Smoke scripts
- Contract files for templates, orders, payments and webhooks
- Order state machine

## Real templates

- `psicologo-clinico-agenda`
- `formacion-cursos-consultas`

## Important invariants

- Template data is the source of truth for price.
- The frontend must not decide price.
- An order must exist before checkout.
- Success pages must not mark orders as paid.
- Payment approval must come from webhook reconciliation.
- Webhook raw events must be persisted before processing.
- Order status changes must go through the state machine.

## Not production-ready yet

- SQLite is local-only and not appropriate for deployed production.
- No hosted database is configured.
- Mercado Pago real checkout is not integrated.
- Mercado Pago webhook signature validation is not integrated.
- No real payment reconciliation exists.
- Admin auth is minimal/basic.
- No analytics events yet.
- No email/internal notification yet.
- No rollback/deploy checklist yet.

## Recommended next bottleneck

Before Mercado Pago: move order persistence to a hosted Postgres-compatible database.

Good next options:

- Supabase Postgres
- Neon
- Prisma Postgres
- Vercel Postgres-compatible setup

Only after hosted DB is stable should Mercado Pago real checkout/webhooks be connected.
