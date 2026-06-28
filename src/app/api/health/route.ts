export function GET() {
  return Response.json({
    ok: true,
    service: 'site-factory-showcase',
    timestamp: new Date().toISOString(),
  });
}
