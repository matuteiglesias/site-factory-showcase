# Next Backlog

## P0 — Close current demo

- Confirm `/`
- Confirm `/templates`
- Confirm `/templates/[slug]`
- Confirm `/pedido?template=...`
- Confirm order submission
- Confirm `/pedido/gracias?order=...`
- Confirm `/admin/orders`
- Confirm `npm run smoke:m2`
- Confirm repo does not track local SQLite DB

## P1 — Hosted DB migration

Goal: deployed app can persist real orders.

Tasks:

- Provision Neon Postgres
- Set `DATABASE_URL` to the Neon pooled connection string
- Run Prisma deploy migration
- Verify order creation in deployed preview
- Verify admin order detail reads deployed DB
- Document migration commands

Acceptance:

- A real user can submit an order on the deployed URL.
- The order persists after redeploy.
- Local SQLite is no longer the assumed production path.

## P2 — Mercado Pago checkout

Goal: real order can start checkout.

Tasks:

- Implement `PaymentProvider` interface
- Implement Mercado Pago preference creation
- Store `payment_attempt`
- Use `external_reference = order.publicId`
- Add success/failure/pending pages
- Do not mark paid from success URL

Acceptance:

- Existing order can redirect to Mercado Pago.
- Amount comes from server-side template/order data.
- Payment attempt is stored.

## P3 — Mercado Pago webhook/reconciliation

Goal: only verified payments mark orders as paid.

Tasks:

- Add webhook endpoint
- Validate `x-signature`
- Store raw webhook event
- Fetch full payment from Mercado Pago
- Verify `external_reference`
- Verify amount/currency
- Make processing idempotent
- Transition order through state machine

Acceptance:

- Approved verified payment marks order paid.
- Duplicate webhook does not duplicate effects.
- Invalid signature returns 401.
- Success URL alone never changes order status.

## P4 — Market activity

Goal: start getting signal from real prospects.

Tasks:

- Add analytics events
- Add contact CTA
- Add simple “what happens next” section
- Add 1–2 more templates
- Add short public FAQ
- Prepare shareable demo copy
