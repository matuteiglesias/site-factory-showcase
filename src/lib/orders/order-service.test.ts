import { beforeEach, describe, expect, it, vi } from 'vitest';

const { orderRecord, activeTemplate, draftTemplate } = vi.hoisted(() => {
  const activeTemplate = {
    slug: 'active-test-template',
    status: 'active',
    price: {
      amountARS: 123456,
      currency: 'ARS',
      kind: 'from',
    },
  };

  const draftTemplate = {
    slug: 'draft-test-template',
    status: 'draft',
    price: {
      amountARS: 999999,
      currency: 'ARS',
      kind: 'from',
    },
  };

  return {
    activeTemplate,
    draftTemplate,
    orderRecord: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
});

vi.mock('server-only', () => ({}));

vi.mock('@/content/templates', () => ({
  activeTemplates: [activeTemplate],
  getTemplateBySlug: (slug: string) =>
    [activeTemplate, draftTemplate].find((template) => template.slug === slug),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    orderRecord,
  },
}));

const { createOrder } = await import('@/lib/orders/order-service');
const { listOrders, transitionOrderRecord } = await import(
  '@/lib/orders/prisma-order-repository'
);

function validOrderInput(overrides: Record<string, unknown> = {}) {
  return {
    templateSlug: activeTemplate.slug,
    customer: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      whatsapp: '+54 9 11 5555 5555',
    },
    brief: {
      businessName: 'Ada Studio',
      industry: 'Consulting',
      goal: 'Launch a professional website that explains services and captures qualified leads.',
      hasLogo: false,
      hasCopy: false,
      hasDomain: false,
      notes: 'Test order.',
    },
    ...overrides,
  };
}

function orderRecordResult(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-06-28T12:00:00.000Z');

  return {
    id: 'order_test_123',
    publicId: 'ord_test_123',
    templateSlug: activeTemplate.slug,
    customerJson: JSON.stringify(validOrderInput().customer),
    briefJson: JSON.stringify(validOrderInput().brief),
    amountARS: activeTemplate.price.amountARS,
    currency: 'ARS',
    status: 'pending_payment',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('repository-backed order invariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not create an order for a missing template', async () => {
    await expect(
      createOrder(validOrderInput({ templateSlug: 'missing-test-template' })),
    ).rejects.toThrow(/Template is not active or does not exist/);

    expect(orderRecord.create).not.toHaveBeenCalled();
  });

  it('does not create an order for a draft template', async () => {
    await expect(
      createOrder(validOrderInput({ templateSlug: draftTemplate.slug })),
    ).rejects.toThrow(/Template is not active or does not exist/);

    expect(orderRecord.create).not.toHaveBeenCalled();
  });

  it('uses the server-side template amount when creating an order', async () => {
    orderRecord.create.mockResolvedValueOnce(orderRecordResult());

    const order = await createOrder(
      validOrderInput({
        amountARS: 1,
        currency: 'ARS',
      }),
    );

    expect(orderRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amountARS: activeTemplate.price.amountARS,
        }),
      }),
    );
    expect(order.amountARS).toBe(activeTemplate.price.amountARS);
  });

  it('starts a new order in pending_payment', async () => {
    orderRecord.create.mockResolvedValueOnce(orderRecordResult());

    const order = await createOrder(validOrderInput());

    expect(orderRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'pending_payment',
        }),
      }),
    );
    expect(order.status).toBe('pending_payment');
  });

  it('passes admin list filters to the repository query', async () => {
    orderRecord.findMany.mockResolvedValueOnce([]);

    await listOrders({
      status: 'pending_payment',
      templateSlug: activeTemplate.slug,
    });

    expect(orderRecord.findMany).toHaveBeenCalledWith({
      where: {
        status: 'pending_payment',
        templateSlug: activeTemplate.slug,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('rejects invalid state transitions before updating the record', async () => {
    orderRecord.findUnique.mockResolvedValueOnce(orderRecordResult());

    await expect(
      transitionOrderRecord({
        publicId: 'ord_test_123',
        to: 'delivered',
        reason: 'invalid direct delivery',
      }),
    ).rejects.toThrow(/Invalid order transition/);

    expect(orderRecord.update).not.toHaveBeenCalled();
  });
});
