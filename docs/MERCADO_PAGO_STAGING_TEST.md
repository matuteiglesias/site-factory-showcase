# Mercado Pago staging test checklist

Use this checklist when Mercado Pago test credentials are available in the target environment.

Required environment variables:

- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `NEXT_PUBLIC_BASE_URL`
- `DATABASE_URL`

Manual staging flow:

1. Create an order through the public order form or `POST /api/orders`.
2. Start checkout with `POST /api/checkout/mercadopago` using only `orderPublicId`.
3. Confirm a Mercado Pago preference is created and a payment attempt is stored.
4. Follow the returned `init_point` and complete the payment with Mercado Pago test credentials.
5. Confirm `/checkout/success` only displays the current server-side order status and does not mark the order paid from redirect query params.
6. Confirm `POST /api/webhooks/mercadopago` stores the raw webhook event before reconciliation.
7. Confirm an approved, verified payment transitions the order through the state machine to the appropriate post-payment status.
8. Confirm a rejected payment does not mark the order paid.
9. Send the same verified webhook twice and confirm the duplicate does not duplicate order/payment-attempt effects.
10. Confirm the admin order detail shows payment-attempt and webhook history for the order.
