import { ZodError, z } from 'zod';

import { getOrderByPublicId } from '@/lib/orders/prisma-order-repository';
import {
  createMercadoPagoProvider,
  loadMercadoPagoProviderConfig,
} from '@/lib/payments/mercadopago-provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const checkoutInputSchema = z
  .object({
    orderPublicId: z.string().min(8),
  })
  .strict();

const checkoutAllowedStatuses = ['pending_payment', 'payment_failed'] as const;
const frontendAmountKeys = new Set([
  'amount',
  'amountARS',
  'price',
  'unit_price',
  'total',
]);

function hasFrontendProvidedAmount(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasFrontendProvidedAmount);
  }

  return Object.entries(value).some(
    ([key, nestedValue]) =>
      frontendAmountKeys.has(key) || hasFrontendProvidedAmount(nestedValue),
  );
}

function isCheckoutAllowedStatus(status: string): boolean {
  return checkoutAllowedStatuses.includes(
    status as (typeof checkoutAllowedStatuses)[number],
  );
}

export async function POST(req: Request) {
  const body = await req.json();

  if (hasFrontendProvidedAmount(body)) {
    return Response.json(
      {
        error: 'frontend_amount_not_allowed',
        message: 'Checkout amounts are calculated on the server.',
      },
      { status: 400 },
    );
  }

  const parsed = checkoutInputSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: 'invalid_checkout_input',
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const order = await getOrderByPublicId(parsed.data.orderPublicId);

  if (!order) {
    return Response.json(
      {
        error: 'order_not_found',
      },
      { status: 404 },
    );
  }

  if (!isCheckoutAllowedStatus(order.status)) {
    return Response.json(
      {
        error: 'invalid_order_status_for_checkout',
        status: order.status,
      },
      { status: 409 },
    );
  }

  let config;

  try {
    config = loadMercadoPagoProviderConfig();
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: 'missing_payment_provider_config',
          message: 'Mercado Pago provider configuration is missing or invalid.',
        },
        { status: 500 },
      );
    }

    throw error;
  }

  try {
    const checkout = await createMercadoPagoProvider(config).createCheckout(
      parsed.data,
    );

    return Response.json({ checkout }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error: 'create_mercado_pago_checkout_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
