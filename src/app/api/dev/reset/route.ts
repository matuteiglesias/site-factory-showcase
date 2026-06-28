import { resetFakeDb } from '@/lib/fake-db/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'not_available_in_production' }, { status: 403 });
  }

  await resetFakeDb();

  return Response.json({ ok: true });
}
