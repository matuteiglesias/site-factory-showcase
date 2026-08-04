# Site Factory Showcase

Catálogo y sistema de pedidos para producir sitios profesionales a partir de templates reales y un brief estructurado.

> **Ciclo de vida:** producto activo y superficie de demostración  
> **Autoridad:** catálogo, captura de pedidos, revisión operativa y persistencia del flujo comercial  
> **No es autoridad para:** el contenido final de cada sitio cliente, el estado contable de pagos ni una fábrica genérica de código  
> **Evidencia revisada para este README:** 2026-08-03 — aplicación, comandos, contrato de despliegue y límites documentados; no se ejecutaron tests ni un despliegue

## Qué problema resuelve

Site Factory Showcase convierte una solicitud difusa de “quiero una web” en un flujo controlado:

1. la persona navega templates reales;
2. elige un punto de partida;
3. completa un brief con los insumos mínimos;
4. el pedido queda persistido;
5. administración revisa alcance y materiales;
6. se coordina pago y producción fuera del envío inicial;
7. el equipo produce el sitio específico en su repositorio correspondiente.

La aplicación separa catálogo, pedido, revisión comercial y producción. Enviar el formulario no inicia automáticamente un cobro ni convierte el pedido en trabajo aceptado.

## Alcance actual

La implementación incluye:

- catálogo público de templates;
- páginas de detalle;
- formulario y API de pedidos;
- identificadores públicos para consultar pedidos;
- persistencia PostgreSQL mediante Prisma;
- panel operativo protegido con autenticación básica;
- scripts de migración, verificación y smoke tests;
- documentación de despliegue para Vercel + Neon Postgres.

### Límites conocidos

- Mercado Pago real todavía no está implementado;
- no hay conciliación ni validación de webhooks de pago;
- las páginas de éxito, error o pendiente no deben marcar pedidos como pagados;
- no existe dashboard de cliente;
- no existe CMS;
- la protección de administración sigue siendo Basic Auth;
- algunos smoke tests crean pedidos reales de prueba.

Estos límites son parte del contrato actual, no tareas que deban ocultarse en el README.

## Fronteras del repositorio

### Este repositorio administra

- la experiencia pública del catálogo y pedido;
- el esquema y persistencia de pedidos;
- el panel interno de revisión;
- las reglas técnicas del flujo comercial implementado;
- migrations y contrato de despliegue de esta aplicación;
- la demostración de cómo se solicita un sitio.

### Este repositorio no administra

- el código fuente de cada sitio cliente;
- el contenido definitivo entregado por clientes;
- la producción creativa completa de marca;
- facturación o contabilidad;
- confirmaciones manuales de alcance y pago;
- una abstracción universal para cualquier tipo de sitio.

Los sitios concretos deben vivir en repositorios separados. Este sistema registra y orienta el pedido; no absorbe la implementación de todos ellos.

## Desarrollo local

Requisitos:

- Node.js compatible con Next.js 16;
- npm;
- PostgreSQL descartable para desarrollo.

Instalación:

```bash
npm install
cp .env.example .env
```

Configurar `DATABASE_URL` contra una base de desarrollo. No usar producción.

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Abrir <http://localhost:3000>.

La documentación incluye un ejemplo de contenedor PostgreSQL local en `docs/DEPLOYMENT.md`.

## Variables de entorno

Para un despliegue funcional:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | URL canónica del ambiente |
| `DATABASE_URL` | conexión PostgreSQL/Neon; secreto |
| `ADMIN_USER` | usuario Basic Auth; secreto |
| `ADMIN_PASSWORD` | contraseña Basic Auth; secreto |
| `NEXT_PUBLIC_SHOW_OPS_LINK` | visibilidad del enlace operativo; no autoriza |
| `MP_ACCESS_TOKEN` | reservado para Mercado Pago real |
| `MP_WEBHOOK_SECRET` | reservado para validación de webhooks |
| `INTERNAL_NOTIFICATION_WEBHOOK_URL` | integración interna opcional futura |

Nunca versionar valores reales. `NEXT_PUBLIC_SHOW_OPS_LINK` sólo controla interfaz; la autorización depende de Basic Auth.

## Verificación

Chequeo integral declarado:

```bash
npm run check
```

Ese comando ejecuta:

- verificación de que no haya bases locales versionadas;
- typecheck;
- lint;
- tests;
- build.

Otros comandos:

```bash
npm run smoke
npm run smoke:m1
npm run smoke:m2
npm run smoke:deploy
```

**Advertencia:** `smoke:m2` y `smoke:deploy` crean pedidos. Ejecutarlos sólo en ambientes donde los datos de prueba sean aceptables.

## Despliegue

La ruta documentada es Vercel con Neon Postgres.

Antes de promover un ambiente:

1. definir las variables correctas;
2. ejecutar `npm run db:migrate:deploy`;
3. confirmar que administración está protegida;
4. ejecutar `npm run smoke:deploy` contra la URL exacta;
5. comprobar que un pedido persiste después de un redeploy;
6. mantener pagos reales deshabilitados hasta completar la integración correspondiente.

El runbook completo, rollback y contratos de ambiente están en [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

Este README no afirma una URL de producción activa porque no se verificó un despliegue durante este cambio.

## Datos y seguridad

Los pedidos pueden contener nombres, contacto, necesidades comerciales y materiales del cliente.

- aplicar mínimo acceso al panel;
- no registrar secretos en logs;
- no usar bases de producción para desarrollo o smoke tests;
- revisar retención y eliminación de datos;
- no exponer rutas administrativas mediante una bandera visual;
- tratar previews como ambientes con datos potencialmente reales;
- separar estados comerciales, productivos y de pago.

## Estructura principal

- `src/app/` — páginas y rutas de aplicación;
- `src/components/` — experiencia pública y operativa;
- `prisma/` — esquema y migrations PostgreSQL;
- `scripts/` — verificaciones y smoke tests;
- `docs/DEPLOYMENT.md` — contrato operativo de despliegue;
- `.env.example` — nombres y valores de ejemplo, nunca secretos reales.

## Alcance de la verificación actual

Para este README se inspeccionaron la portada pública, `package.json` y el runbook de despliegue. No se instalaron dependencias, no se ejecutó `npm run check`, no se creó un pedido y no se verificó Vercel, Neon ni ninguna integración externa.
