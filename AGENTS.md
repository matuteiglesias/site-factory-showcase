# Site Factory Showcase - Agent Rules

This project is a commercial/order intake app for selling static professional websites.

Core invariants:

1. Do not mark an order as paid from a success URL.
2. Do not read price or amount from the frontend.
3. Do not create a checkout without an existing order.
4. Do not change order status directly; use the order state machine.
5. Do not process Mercado Pago webhooks without storing the raw event.
6. Do not duplicate effects when receiving duplicate webhooks.
7. Do not expose secrets in frontend code, logs, or fixtures.
8. Do not add auth, CMS, dashboard frameworks, or database libraries unless the task explicitly requires it.
9. Keep templates as typed local data until the project needs a CMS.
10. Prefer small vertical slices with tests over broad UI rewrites.

Current milestone:

- Repo skeleton
- TypeScript contracts
- Seed templates
- Minimal routes
- Typecheck and tests passing
