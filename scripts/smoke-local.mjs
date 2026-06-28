const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

const paths = ['/', '/templates', '/templates/psicologo-calido-agenda', '/api/health'];

for (const path of paths) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Smoke failed: ${url} returned ${res.status}`);
  }

  console.log(`OK ${res.status} ${url}`);
}
