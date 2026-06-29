import { ZodError } from 'zod';

import { createOrder } from '@/lib/orders/order-service';
import { listOrders } from '@/lib/orders/prisma-order-repository';

const fieldLabels: Record<string, string> = {
  templateSlug: 'template elegido',
  'customer.name': 'nombre',
  'customer.email': 'email',
  'customer.whatsapp': 'WhatsApp',
  'brief.businessName': 'nombre del negocio o profesional',
  'brief.industry': 'rubro',
  'brief.goal': 'objetivo del sitio',
  'brief.notes': 'notas adicionales',
};

const formFieldNames: Record<string, string> = {
  templateSlug: 'templateSlug',
  'customer.name': 'name',
  'customer.email': 'email',
  'customer.whatsapp': 'whatsapp',
  'brief.businessName': 'businessName',
  'brief.industry': 'industry',
  'brief.goal': 'goal',
  'brief.notes': 'notes',
};

function formatZodIssues(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  const issueMessages = error.issues.map((issue) => {
    const path = issue.path.join('.');
    const label = fieldLabels[path] ?? (path || 'pedido');
    const fieldName = formFieldNames[path];
    const message = `${label}: ${issue.message}`;

    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }

    return message;
  });

  return { fieldErrors, issueMessages };
}

function templateErrorResponse(message: string) {
  return Response.json(
    {
      error: 'template_not_orderable',
      message:
        'El template elegido no está disponible para pedidos públicos. Elegí un template activo del catálogo.',
      fieldErrors: {
        templateSlug: message,
      },
    },
    { status: 400 },
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const orders = await listOrders();
  return Response.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = await createOrder(body);

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const { fieldErrors, issueMessages } = formatZodIssues(error);

      return Response.json(
        {
          error: 'invalid_order_input',
          message: 'Revisá los datos del pedido antes de enviarlo.',
          fieldErrors,
          issues: issueMessages,
        },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message.startsWith('Template is not active or does not exist')
    ) {
      return templateErrorResponse(error.message);
    }

    return Response.json(
      {
        error: 'create_order_failed',
        message:
          'No pudimos crear el pedido en este momento. Revisá los datos o intentá nuevamente.',
      },
      { status: 400 },
    );
  }
}
