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

const email = `m2-${Date.now()}@example.com`;

const orderPayload = {
  templateSlug: 'psicologo-clinico-agenda',
  customer: {
    name: 'Cliente Real M2',
    email,
    whatsapp: '+54 9 11 5555 5555',
  },
  brief: {
    businessName: 'Consultorio Demo M2',
    industry: 'Psicología',
    goal: 'Quiero recibir consultas profesionales y mostrar mi enfoque de trabajo con una landing clara.',
    hasLogo: false,
    hasCopy: false,
    hasDomain: false,
    notes: 'Pedido creado por smoke-m2.',
  },
};

console.log('Creating real DB order...');
const { order } = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(orderPayload),
});

if (order.status !== 'pending_payment') {
  throw new Error(`Expected pending_payment, got ${order.status}`);
}

console.log(`OK order persisted: ${order.publicId}`);

const fetched = await request(`/api/orders/${order.publicId}`);

if (fetched.order.customer.email !== email) {
  throw new Error('Fetched order email mismatch');
}

console.log(`OK fetched order: ${fetched.order.publicId}`);
console.log(`Open: ${baseUrl}/admin/orders/${order.publicId}`);
