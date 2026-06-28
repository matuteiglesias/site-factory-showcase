const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

async function request(path, init) {
  const res = await fetch(`${baseUrl}${path}`, init);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `Request failed ${res.status} ${path}: ${JSON.stringify(json)}`,
    );
  }

  return json;
}

const orderPayload = {
  templateSlug: 'psicologo-calido-agenda',
  customer: {
    name: 'Smoke Test Client',
    email: `smoke-${Date.now()}@example.com`,
    whatsapp: '+54 9 11 5555 5555',
  },
  brief: {
    businessName: 'Smoke Test Studio',
    industry: 'Servicios profesionales',
    goal: 'Validate fake vertical slice from order creation to fake webhook reconciliation.',
    hasLogo: true,
    hasCopy: true,
    hasDomain: false,
    notes: 'Created by smoke-m1.',
  },
};

console.log('Creating order...');
const { order } = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(orderPayload),
});

console.log(`Order created: ${order.publicId} (${order.status})`);

console.log('Creating fake checkout...');
const { checkout } = await request('/api/checkout/fake', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ orderPublicId: order.publicId }),
});

console.log(`Checkout created: ${checkout.checkoutUrl}`);

console.log('Processing fake approved webhook...');
const webhookResult = await request('/api/webhooks/fake', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    orderPublicId: order.publicId,
    providerStatus: 'approved',
  }),
});

console.log(
  `Webhook processed: ${webhookResult.webhookEventId}; order=${webhookResult.order.status}`,
);

const final = await request(`/api/orders/${order.publicId}`);

if (!['ready_for_production', 'input_incomplete'].includes(final.order.status)) {
  throw new Error(`Unexpected final status: ${final.order.status}`);
}

console.log(`OK final order status: ${final.order.status}`);
console.log(`Open: ${baseUrl}/admin/orders/${order.publicId}`);
