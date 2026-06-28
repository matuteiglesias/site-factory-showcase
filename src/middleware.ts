import { NextRequest, NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Showcase Ops"',
    },
  });
}

export function middleware(req: NextRequest) {
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Local dev remains frictionless unless credentials are configured.
  if (!adminUser || !adminPassword) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Admin credentials missing', { status: 503 });
    }

    return NextResponse.next();
  }

  const auth = req.headers.get('authorization');

  if (!auth?.startsWith('Basic ')) {
    return unauthorized();
  }

  const encoded = auth.slice('Basic '.length);
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const [user, password] = decoded.split(':');

  if (user !== adminUser || password !== adminPassword) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/dev/:path*'],
};
