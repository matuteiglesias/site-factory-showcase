import { ZodError } from 'zod';

import { processFakeWebhook } from '@/lib/webhooks/fake-webhook-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await processFakeWebhook(body);

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: 'invalid_fake_webhook_input',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error: 'fake_webhook_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
