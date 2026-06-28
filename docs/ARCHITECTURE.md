# Architecture

## Product flow

Catalog
→ Template detail
→ Intake form
→ Internal order
→ Mercado Pago checkout
→ Webhook
→ Payment reconciliation
→ Operational order state
→ Production
→ Preview
→ Delivery

## Layers

### Marketing layer

- `/templates`
- `/templates/[slug]`
- Static catalog
- SEO metadata

### Commerce layer

- Orders
- Checkout attempts
- Payment attempts

### Payment integration layer

- Mercado Pago preference creation
- Mercado Pago webhook receiver
- Signature validation
- Payment reconciliation

### Operations layer

- Order state machine
- Internal queue
- Manual transitions
- Webhook/payment audit trail

## Current milestone

Milestone 0 only establishes the repository, contracts, seed data, minimal routes, and tests.

Not included yet:

- Database
- Mercado Pago SDK
- Webhook implementation
- Admin console
- Auth
- CMS
- Client dashboard
