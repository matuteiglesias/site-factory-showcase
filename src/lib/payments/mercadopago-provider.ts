import 'server-only';

import { z } from 'zod';

import type { CreateCheckoutResult } from '@/contracts/payment';
import type { Order } from '@/contracts/order';
import { prismaOrderRepository } from '@/lib/orders/prisma-order-repository';
import type {
  CreateCheckoutForOrderInput,
  PaymentAttemptRepository,
  PaymentProvider,
} from '@/lib/payments/payment-provider';
import { createPaymentAttemptRecord } from '@/lib/fake-db/store';

const mercadoPagoEnvSchema = z.object({
  MERCADO_PAGO_ACCESS_TOKEN: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
});

const mercadoPagoPreferenceResponseSchema = z.object({
  id: z.string().min(1),
  init_point: z.string().url(),
});

export type MercadoPagoProviderEnv = z.infer<typeof mercadoPagoEnvSchema>;

export type MercadoPagoProviderConfig = {
  accessToken: string;
  baseUrl: string;
};

type MercadoPagoFetch = (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => Promise<Response>;

export type MercadoPagoProviderDependencies = {
  orderRepository: Pick<typeof prismaOrderRepository, 'findByPublicId'>;
  paymentAttemptRepository: Pick<PaymentAttemptRepository, 'create'>;
  fetch: MercadoPagoFetch;
};

const defaultPaymentAttemptRepository: Pick<PaymentAttemptRepository, 'create'> = {
  create: createPaymentAttemptRecord,
};

function getDefaultDependencies(): MercadoPagoProviderDependencies {
  return {
    orderRepository: prismaOrderRepository,
    paymentAttemptRepository: defaultPaymentAttemptRepository,
    fetch: globalThis.fetch,
  };
}

function checkoutUrl(baseUrl: string, path: 'success' | 'failure' | 'pending') {
  return new URL(`/checkout/${path}`, baseUrl).toString();
}

function notificationUrl(baseUrl: string) {
  return new URL('/api/webhooks/mercadopago', baseUrl).toString();
}

function buildPreferenceBody(order: Order, baseUrl: string) {
  return {
    items: [
      {
        title: `Sitio profesional: ${order.templateSlug}`,
        quantity: 1,
        unit_price: order.amountARS,
        currency_id: order.currency,
      },
    ],
    payer: {
      name: order.customer.name,
      email: order.customer.email,
    },
    external_reference: order.publicId,
    back_urls: {
      success: checkoutUrl(baseUrl, 'success'),
      failure: checkoutUrl(baseUrl, 'failure'),
      pending: checkoutUrl(baseUrl, 'pending'),
    },
    notification_url: notificationUrl(baseUrl),
    auto_return: 'approved',
  };
}

export function loadMercadoPagoProviderConfig(
  env: Record<string, string | undefined> = process.env,
): MercadoPagoProviderConfig {
  const parsed = mercadoPagoEnvSchema.parse(env);

  return {
    accessToken: parsed.MERCADO_PAGO_ACCESS_TOKEN,
    baseUrl: parsed.NEXT_PUBLIC_BASE_URL,
  };
}

export function createMercadoPagoProvider(
  config: MercadoPagoProviderConfig = loadMercadoPagoProviderConfig(),
  dependencies: MercadoPagoProviderDependencies = getDefaultDependencies(),
): PaymentProvider {
  return {
    provider: 'mercadopago',

    async createCheckout(
      input: CreateCheckoutForOrderInput,
    ): Promise<CreateCheckoutResult> {
      const order = await dependencies.orderRepository.findByPublicId(
        input.orderPublicId,
      );

      if (!order) {
        throw new Error(`Order not found: ${input.orderPublicId}`);
      }

      const preferenceBody = buildPreferenceBody(order, config.baseUrl);
      const response = await dependencies.fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferenceBody),
        },
      );

      if (!response.ok) {
        throw new Error(`Mercado Pago preference creation failed: ${response.status}`);
      }

      const preference = mercadoPagoPreferenceResponseSchema.parse(
        await response.json(),
      );

      await dependencies.paymentAttemptRepository.create({
        order,
        providerPreferenceId: preference.id,
        checkoutUrl: preference.init_point,
        rawResponse: preference,
      });

      return {
        provider: 'mercadopago',
        orderPublicId: order.publicId,
        providerPreferenceId: preference.id,
        checkoutUrl: preference.init_point,
      };
    },
  };
}
