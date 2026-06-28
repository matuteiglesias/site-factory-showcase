Sí. Pensemos esto como si tuviéramos **24 personas**, pero sin caer en la fantasía de “24 personas = 24x velocidad”. Para que funcione, el diseño tiene que permitir trabajo paralelo con **interfaces estables**, módulos testeables por separado y una integración temprana.

La arquitectura de equipo debería seguir la arquitectura del producto.

# 1. Principio rector

El sistema no se divide por “pantallas”, sino por **responsabilidades operativas**:

```txt
Catálogo
→ Pedido
→ Checkout
→ Webhook
→ Reconciliación
→ Estado interno
→ Operación / entrega
```

Cada equipo puede avanzar en paralelo si antes congelamos contratos mínimos:

```txt
TemplateContract
OrderContract
PaymentAttemptContract
WebhookEventContract
OrderStateMachineContract
NotificationContract
```

La mala versión sería:

```txt
Equipo A hace frontend.
Equipo B hace backend.
Equipo C hace pagos.
Equipo D hace base de datos.
Después “integramos”.
```

Eso termina en fricción. La versión buena:

```txt
Primero definimos contratos.
Después cada equipo implementa contra esos contratos.
Cada módulo tiene mocks/stubs.
La integración empieza desde el día 1.
```

---

# 2. Organización sugerida del equipo

Para “pocas decenas”, usaría 6 squads chicos.

## Squad 0 — Architecture / Integration Core

**3 personas**

Responsabilidad:

```txt
- arquitectura general
- contratos TypeScript compartidos
- máquina de estados
- decisiones de carpetas
- PR gates
- integración continua
- ambiente staging
```

No codean todo. Protegen la coherencia.

Outputs:

```txt
src/contracts/template.ts
src/contracts/order.ts
src/contracts/payment.ts
src/contracts/webhook.ts
src/contracts/state-machine.ts
src/lib/result.ts
src/lib/errors.ts
```

Este squad define lo que los demás no pueden inventar por su cuenta.

---

## Squad 1 — Catalog / Showcase

**4 personas**

Responsabilidad:

```txt
- /templates
- /templates/[slug]
- TemplateCard
- TemplateGrid
- TemplateFilters
- TemplateSearchBar
- metadata SEO
- screenshots / demo links
```

Contrato que consumen:

```ts
type Template = {
  slug: string
  title: string
  shortDescription: string
  audience: string[]
  format: 'landing' | 'institutional' | 'docs' | 'portfolio'
  tags: string[]
  screenshot: string
  demoUrl: string
  priceFromARS: number
  deliveryDaysFrom: number
  deliveryDaysTo: number
  includedSections: string[]
  requiredInputs: string[]
  status: 'active' | 'draft' | 'archived'
  featured?: boolean
}
```

Criterio de aceptación:

```txt
- puedo filtrar templates
- puedo abrir ficha
- puedo compartir URL
- CTA lleva a /pedido?template=slug
- ningún template draft aparece públicamente
```

---

## Squad 2 — Intake / Orders

**4 personas**

Responsabilidad:

```txt
- /pedido
- formulario de brief
- validación zod
- POST /api/orders
- persistencia de order
- status inicial pending_payment
```

Contrato central:

```ts
type OrderStatus =
  | 'pending_payment'
  | 'payment_pending'
  | 'paid'
  | 'input_incomplete'
  | 'ready_for_production'
  | 'in_production'
  | 'preview_sent'
  | 'revision_requested'
  | 'approved'
  | 'deployed'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'disputed'
```

Criterio de aceptación:

```txt
- no existe pago sin order_id
- el precio no viene del frontend
- el template_slug se valida contra catálogo
- el brief mínimo queda guardado
- el pedido queda en pending_payment
```

---

## Squad 3 — Mercado Pago Checkout

**4 personas**

Responsabilidad:

```txt
- POST /api/checkout/mercadopago
- creación de preferencia
- back_urls
- external_reference = order.public_id
- payment_attempt inicial
- manejo de errores de MP
```

Contrato:

```ts
type PaymentAttempt = {
  id: string
  orderId: string
  provider: 'mercadopago'
  providerPreferenceId?: string
  providerPaymentId?: string
  providerStatus?: string
  amountARS: number
  rawResponse: unknown
}
```

Criterio de aceptación:

```txt
- solo se crea checkout para order existente
- solo se crea checkout para status pending_payment
- monto calculado server-side
- external_reference apunta al public_id interno
- se guarda provider_preference_id
- errores de MP no rompen la orden
```

---

## Squad 4 — Webhooks / Reconciliation

**4 personas**

Responsabilidad:

```txt
- POST /api/webhooks/mercadopago
- validación x-signature
- persistencia raw del evento
- idempotencia
- consulta payment por data.id
- transición paid
- manejo de retries
```

Contrato:

```ts
type WebhookEvent = {
  id: string
  provider: 'mercadopago'
  providerEventId?: string
  topic?: string
  action?: string
  dataId?: string
  xRequestId?: string
  rawBody: unknown
  processingStatus: 'received' | 'processed' | 'ignored' | 'failed'
  processingError?: string
}
```

Criterio de aceptación:

```txt
- firma inválida devuelve 401
- evento válido se guarda
- evento duplicado no duplica efectos
- success URL no marca paid
- payment approved sí marca paid
- payment rejected/failure no marca paid
- webhook responde rápido
```

Este squad es crítico. Si falla, contaminás producción con pedidos mal pagos, duplicados o ambiguos.

---

## Squad 5 — Operations / Internal Console

**3 personas**

Responsabilidad:

```txt
- vista interna simple de órdenes
- filtros por estado
- detalle de pedido
- logs de webhook
- botón/checklist de producción
- notificación interna
```

No hace falta login sofisticado al inicio si está protegido por auth básica, Vercel protection, o una capa mínima. Pero sí necesitás visibilidad.

Criterio de aceptación:

```txt
- puedo ver órdenes pagas
- puedo ver órdenes con input incompleto
- puedo ver último webhook asociado
- puedo ver errores de reconciliación
- puedo marcar pedido como in_production / preview_sent / delivered
```

---

## Squad 6 — QA / SRE / Release

**3–4 personas**

Responsabilidad:

```txt
- matriz de tests
- entorno staging
- variables de entorno
- smoke tests
- logging
- analytics
- checklist de deploy
- rollback plan
```

Criterio de aceptación:

```txt
- staging tiene MP test/sandbox configurado
- producción tiene secrets separados
- smoke test cubre catálogo → pedido → checkout → webhook simulado
- hay logs útiles
- hay rollback
```

---

# 3. Contratos que deben definirse antes de codear fuerte

Esto sería el primer entregable de ingeniería.

## 3.1 Contract: Template

```ts
type TemplateSlug = string

type Template = {
  slug: TemplateSlug
  title: string
  shortDescription: string
  longDescription: string
  audience: string[]
  format: 'landing' | 'institutional' | 'docs' | 'portfolio'
  tags: string[]
  screenshot: string
  demoUrl: string
  priceARS: number
  deliveryDays: {
    min: number
    max: number
  }
  includedSections: string[]
  requiredInputs: string[]
  status: 'active' | 'draft' | 'archived'
  featured: boolean
}
```

Regla:

```txt
El catálogo es fuente de verdad para precio base, template_slug y status.
El frontend nunca decide precio.
```

---

## 3.2 Contract: Order

```ts
type Order = {
  id: string
  publicId: string
  templateSlug: string
  customer: {
    name: string
    email: string
    whatsapp?: string
  }
  brief: {
    businessName?: string
    industry?: string
    goal: string
    hasLogo: boolean
    hasCopy: boolean
    hasDomain: boolean
    notes?: string
  }
  amountARS: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}
```

Regla:

```txt
Order existe antes del pago.
Order.publicId viaja a Mercado Pago como external_reference.
```

---

## 3.3 Contract: State transition

```ts
type OrderTransition = {
  from: OrderStatus
  to: OrderStatus
  reason: string
  actor: 'system' | 'admin' | 'mercadopago'
  metadata?: Record<string, unknown>
}
```

Regla:

```txt
Nadie cambia order.status directamente.
Todo pasa por transitionOrderStatus().
```

Esto evita que cada squad haga `order.status = 'paid'` a su manera.

---

## 3.4 Contract: Payment reconciliation

```ts
type ReconciliationResult =
  | {
      ok: true
      orderId: string
      paymentStatus: 'approved'
      transition: 'paid' | 'ready_for_production'
    }
  | {
      ok: false
      reason:
        | 'invalid_signature'
        | 'payment_not_found'
        | 'order_not_found'
        | 'amount_mismatch'
        | 'currency_mismatch'
        | 'duplicate_event'
        | 'payment_not_approved'
    }
```

Regla:

```txt
El webhook no “cree” el pago.
El reconciler verifica el recurso completo en Mercado Pago.
```

---

# 4. Dependencias entre módulos

La secuencia lógica no es lineal, pero las dependencias sí.

```txt
Contracts
  ↓
Catalog ───────→ Intake
                    ↓
                 Orders
                    ↓
                 Checkout MP
                    ↓
                 Webhooks
                    ↓
              Reconciliation
                    ↓
              Operations Console
```

Pero para trabajar en paralelo:

```txt
Catalog puede usar mock templates.
Intake puede usar mock templates.
Checkout puede usar fake order repository.
Webhook puede usar fake MercadoPago client.
Ops puede usar seed orders.
QA puede usar fixtures desde el día 1.
```

La integración se logra con adapters.

---

# 5. Fixtures compartidas

Antes de implementar todo, crearía fixtures oficiales:

```txt
fixtures/
  templates/
    psicologo-calido.json
    abogado-serio.json
    consultor-premium.json

  orders/
    pending-payment.json
    paid-ready.json
    input-incomplete.json

  mercadopago/
    webhook-payment-created.json
    payment-approved.json
    payment-rejected.json
    payment-duplicate.json
```

Cada squad testea contra las mismas fixtures. Eso reduce la típica deriva de “mi mock no era igual al tuyo”.

---

# 6. Ambientes

Necesitás tres ambientes, aunque sean simples.

```txt
local
- usa mocks
- DB local o Supabase branch/dev
- MP opcional

staging
- usa credenciales test/productive test según MP permita
- URL pública para webhook
- datos descartables

production
- secrets reales
- webhook real
- analytics/logs reales
```

Nunca mezclar:

```txt
MP_ACCESS_TOKEN_TEST
MP_ACCESS_TOKEN_PROD
MP_WEBHOOK_SECRET_TEST
MP_WEBHOOK_SECRET_PROD
NEXT_PUBLIC_BASE_URL_STAGING
NEXT_PUBLIC_BASE_URL_PROD
```

---

# 7. Plan de integración por milestones

## Milestone 0 — Contratos y skeleton

Duración ideal: muy corto.

Output:

```txt
- repo inicial
- app router
- contratos TS
- carpetas
- lint/typecheck/test
- seed data
- env.example
- README de arquitectura
```

Criterio:

```txt
npm run typecheck pasa
npm run test pasa
npm run dev levanta
```

---

## Milestone 1 — Vertical slice falsa

Objetivo: tener el flujo entero funcionando con mocks.

```txt
/templates
→ /templates/[slug]
→ /pedido?template=...
→ POST /api/orders fake
→ checkout fake
→ webhook fake
→ order paid fake
→ ops ve pedido
```

Esto no vende todavía, pero valida arquitectura.

Criterio:

```txt
Un pedido puede recorrer todo el sistema sin Mercado Pago real.
```

Este milestone es importante porque fuerza a todos los squads a integrarse temprano.

---

## Milestone 2 — Catálogo real + order real

```txt
- templates.ts real
- páginas estáticas reales
- formulario real
- DB real para orders
- status pending_payment
```

Criterio:

```txt
Un usuario real puede dejar un pedido estructurado.
```

Incluso sin pago, esto ya tiene valor comercial.

---

## Milestone 3 — Checkout MP

```txt
- creación de preferencia real
- redirect a Mercado Pago
- payment_attempt guardado
- back_urls configuradas
```

Criterio:

```txt
Una orden real puede iniciar checkout.
```

Todavía no damos por pago nada desde success.

---

## Milestone 4 — Webhook + reconciliación

```txt
- endpoint público
- firma validada
- evento guardado
- payment consultado
- estado actualizado
- idempotencia probada
```

Criterio:

```txt
Solo un payment approved verificado marca la orden como paid.
```

---

## Milestone 5 — Operación interna

```txt
- dashboard interno simple
- lista de pedidos
- detalle de pedido
- logs de pagos/webhooks
- transición manual a in_production / preview_sent / delivered
```

Criterio:

```txt
Podés operar 5–10 pedidos sin perderte.
```

---

## Milestone 6 — Production hardening

```txt
- error logging
- analytics comercial
- smoke tests
- backups
- dashboard MP revisado
- env vars auditadas
- política de rollback
```

Criterio:

```txt
Podés recibir dinero real sin depender de mirar la consola en vivo.
```

---

# 8. Cómo trabajan en paralelo sin romperse

La regla sería: **cada squad publica un contrato y un mock adapter**.

Ejemplo:

## Orders squad expone

```ts
interface OrderRepository {
  createOrder(input: CreateOrderInput): Promise<Order>
  getOrderByPublicId(publicId: string): Promise<Order | null>
  transitionOrder(input: OrderTransitionInput): Promise<Order>
}
```

Mientras no haya DB real:

```ts
class InMemoryOrderRepository implements OrderRepository {}
```

Después:

```ts
class PostgresOrderRepository implements OrderRepository {}
```

El resto del sistema no debería notar el cambio.

---

## Mercado Pago squad expone

```ts
interface PaymentProvider {
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>
  getPayment(providerPaymentId: string): Promise<ProviderPayment>
}
```

Adapters:

```txt
FakePaymentProvider
MercadoPagoPaymentProvider
```

Entonces Webhook/Reconciliation puede avanzar con fake provider antes de que la integración real esté lista.

---

# 9. PR gates

Cada PR debería cumplir:

```txt
- typecheck
- lint
- unit tests
- no env secrets
- no cambio directo de status fuera de state machine
- no precio leído desde frontend
- no webhook sin raw event logging
```

Para archivos críticos, CODEOWNERS:

```txt
src/contracts/*                  @architecture
src/lib/orders/order-machine.ts  @architecture @orders
src/lib/payments/*               @payments @architecture
app/api/webhooks/*               @payments @sre
```

Esto evita que alguien “arregle rápido” el flujo de pagos rompiendo invariantes.

---

# 10. Matriz de tests

## Unit tests

```txt
filterTemplates()
validateCreateOrderInput()
transitionOrderStatus()
validateMercadoPagoSignature()
reconcilePayment()
```

## Integration tests

```txt
POST /api/orders crea order pending_payment
POST /api/checkout rechaza order inexistente
POST /api/checkout usa precio server-side
POST /api/webhooks guarda evento
POST /api/webhooks duplicado no duplica transición
```

## E2E tests

```txt
usuario elige template
usuario completa pedido
checkout fake iniciado
webhook fake approved
orden aparece paid en ops
```

## Manual staging checklist

```txt
- MP dashboard tiene webhook correcto
- webhook staging recibe evento
- evento aparece en DB
- payment approved cambia estado
- success page no cambia estado por sí sola
```

---

# 11. Analytics comercial

Desde el comienzo, eventos mínimos:

```txt
template_list_viewed
template_filter_used
template_detail_viewed
template_demo_clicked
order_form_started
order_form_submitted
checkout_started
checkout_redirected
payment_webhook_received
payment_approved
payment_failed
internal_order_ready_for_production
```

Esto no es nice-to-have. Sin esto, después no sabés si el problema es:

```txt
- nadie mira templates
- miran templates pero no abren detalles
- abren detalles pero no piden
- piden pero no pagan
- pagan pero el webhook falla
```

---

# 12. Riesgos principales y mitigaciones

| Riesgo                            | Mitigación                                               |
| --------------------------------- | -------------------------------------------------------- |
| Muchos devs pisan el mismo código | contratos + squads + CODEOWNERS                          |
| Checkout crea pagos sin pedido    | order_id obligatorio antes de checkout                   |
| Precio manipulable desde frontend | precio calculado server-side                             |
| Webhook duplicado duplica efectos | idempotencia                                             |
| Success URL marca pago falso      | success solo muestra estado, no muta                     |
| MP webhook falla silenciosamente  | webhook_events + dashboard interno                       |
| Cliente paga pero input es malo   | estado `input_incomplete`                                |
| Catálogo se vuelve caótico        | tags cerrados + schema de templates                      |
| Producción recibe basura          | pedido solo entra a `ready_for_production` si pasa gates |
| Se sobrediseña dashboard          | vista interna mínima, no CRM                             |

---

# 13. División realista de trabajo

Con 24 personas, haría algo así:

```txt
Architecture Core: 3
Catalog: 4
Intake/Orders: 4
Payments/MP: 4
Ops Console: 3
QA/SRE/Release: 4
Product/Copy/Design: 2
```

Pero ojo: para tu caso real, con IA, vos podés simular varios squads mediante agentes, siempre que les des **fronteras claras**. No “mejorá el checkout”. Mejor:

```txt
Implementá PaymentProvider interface usando Mercado Pago.
No modifiques OrderStatus.
No leas amount del cliente.
No marques paid.
Devolvé CreateCheckoutResult.
Agregá tests para order inexistente y amount server-side.
```

Ese tipo de instrucción reduce rework.

---

# 14. Backlog consolidado por módulo

## A. Catalog

```txt
A1. Definir Template type
A2. Crear templates.ts con 6 templates seed
A3. Crear /templates
A4. Crear filtros client-side
A5. Crear /templates/[slug]
A6. Agregar metadata por template
A7. Agregar CTA a /pedido?template=slug
```

## B. Orders

```txt
B1. Definir CreateOrderInput
B2. Definir OrderStatus
B3. Crear order state machine
B4. Crear tabla orders
B5. Crear POST /api/orders
B6. Crear form /pedido
B7. Validar template_slug y precio
```

## C. Checkout

```txt
C1. Definir PaymentProvider interface
C2. Crear FakePaymentProvider
C3. Crear MercadoPagoPaymentProvider
C4. Crear POST /api/checkout/mercadopago
C5. Guardar payment_attempt
C6. Redirigir a init_point
```

## D. Webhook

```txt
D1. Crear tabla webhook_events
D2. Crear endpoint webhook
D3. Validar x-signature
D4. Guardar raw event
D5. Implementar idempotencia
D6. Consultar payment
D7. Reconciliar external_reference
D8. Transicionar order
```

## E. Ops

```txt
E1. Crear /admin/orders
E2. Crear /admin/orders/[id]
E3. Mostrar estado, brief, pagos, webhooks
E4. Permitir transición manual controlada
E5. Notificación interna cuando ready_for_production
```

## F. QA/SRE

```txt
F1. env.example
F2. staging config
F3. smoke test
F4. logging
F5. analytics events
F6. deployment checklist
F7. rollback checklist
```

---

# 15. Plan comprimido para ejecución con IA

La forma práctica de usar agentes sería por oleadas.

## Oleada 1 — Contratos

Un agente produce:

```txt
/contracts
/lib/state-machine
fixtures
README arquitectura
```

No toca UI ni MP.

## Oleada 2 — Módulos paralelos con mocks

Agentes separados:

```txt
Agente Catalog
Agente Intake
Agente Orders API
Agente Checkout Fake
Agente Ops Fake
Agente Tests
```

Todos contra fixtures.

## Oleada 3 — Integración real

```txt
Agente DB
Agente Mercado Pago
Agente Webhook
Agente Reconciliation
Agente Admin Console
```

## Oleada 4 — Hardening

```txt
Agente QA
Agente Security Review
Agente Analytics
Agente Release Checklist
Agente Copy/UX
```

Lo importante: cada agente recibe un “no tocar” explícito.

Ejemplo:

```txt
No cambies contratos.
No cambies nombres de status.
No agregues estados nuevos.
No cambies schema de templates.
No marques paid desde success.
No leas amount desde frontend.
No borres webhook_events.
```

---

# 16. Definición de “armonía en producción”

No significa que todo esté perfecto. Significa que estas invariantes se cumplen:

```txt
1. Todo template público es active.
2. Todo pedido tiene template válido.
3. Todo checkout tiene order_id.
4. Todo monto viene del servidor.
5. Todo pago aprobado viene de reconciliación MP.
6. Todo webhook queda registrado.
7. Todo retry es idempotente.
8. Todo pedido pago aparece en operación.
9. Ningún pedido entra a producción sin brief mínimo.
10. Todo caso fallido es auditable.
```

Si esas diez cosas se cumplen, el sistema es chico pero serio.

La versión final del plan no es “construir una web app”. Es construir una **línea comercial-operativa**:

```txt
Catálogo vendible
→ pedido estructurado
→ pago verificable
→ estado auditable
→ producción controlada
→ entrega repetible
```

Ese es el núcleo. Todo lo demás —CMS, login, dashboard lindo, generación automática total— viene después.

