import { ZodError } from 'zod';

import { createFakeCheckout } from '@/lib/payments/fake-checkout';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const checkout = await createFakeCheckout(body);

    return Response.json({ checkout }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: 'invalid_checkout_input',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error: 'create_fake_checkout_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
