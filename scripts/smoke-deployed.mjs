const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const adminUser = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_BASE_URL is required for deployed smoke checks.');
}

if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
  throw new Error(
    'smoke:deploy must target a deployed URL, not localhost. Use smoke:m2 for local checks.',
  );
}

if (!adminUser || !adminPassword) {
  throw new Error('ADMIN_USER and ADMIN_PASSWORD are required for admin smoke checks.');
}

const templateSlug = 'psicologo-clinico-agenda';

function url(path) {
  return new URL(path, baseUrl).toString();
}

async function expectOk(path, init) {
  const res = await fetch(url(path), init);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Smoke failed: ${path} returned ${res.status}. ${body}`);
  }

  console.log(`OK ${res.status} ${path}`);
  return res;
}

async function requestJson(path, init) {
  const res = await expectOk(path, init);
  return res.json();
}

const adminAuthorization = `Basic ${Buffer.from(`${adminUser}:${adminPassword}`).toString('base64')}`;

await expectOk('/');
await expectOk('/templates');
await expectOk(`/templates/${templateSlug}`);

const email = `deploy-smoke-${Date.now()}@example.com`;

const orderPayload = {
  templateSlug,
  customer: {
    name: 'Deploy Smoke Client',
    email,
    whatsapp: '+54 9 11 5555 5555',
  },
  brief: {
    businessName: 'Deploy Smoke Studio',
    industry: 'Servicios profesionales',
    goal: 'Validate deployed order persistence before enabling production payment flows.',
    hasLogo: false,
    hasCopy: false,
    hasDomain: false,
    notes: 'Pedido creado por smoke:deploy.',
  },
};

const { order } = await requestJson('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(orderPayload),
});

if (order.status !== 'pending_payment') {
  throw new Error(`Expected pending_payment, got ${order.status}`);
}

console.log(`OK order persisted: ${order.publicId}`);

await expectOk('/admin/orders', {
  headers: {
    authorization: adminAuthorization,
  },
});

console.log(`Open admin order: ${url(`/admin/orders/${order.publicId}`)}`);
