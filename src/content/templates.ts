import { templateSchema, type Template } from '@/contracts/template';

const rawTemplates = [
  {
    slug: 'psicologo-calido-agenda',
    title: 'Psicólogo cálido con agenda',
    shortDescription:
      'Landing profesional para psicólogos con presentación, enfoque, FAQ y agenda online.',
    longDescription:
      'Template pensado para profesionales de salud mental que necesitan transmitir confianza, explicar su enfoque y facilitar el contacto o reserva de turnos.',
    audience: ['psychology', 'health'],
    format: 'landing',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['psicologia', 'salud', 'agenda', 'landing'],
    screenshot: '/templates/psicologo-calido-agenda.png',
    demoUrl: 'https://example.com/demo/psicologo-calido-agenda',
    price: {
      amountARS: 180000,
      currency: 'ARS',
      kind: 'from',
    },
    deliveryDays: {
      min: 5,
      max: 10,
    },
    includedSections: [
      'Hero con propuesta profesional',
      'Bio / presentación',
      'Enfoque de trabajo',
      'Servicios o modalidades',
      'FAQ',
      'Contacto / agenda',
    ],
    requiredInputs: [
      'Nombre profesional',
      'Texto de presentación',
      'Servicios o modalidades',
      'Link de agenda o WhatsApp',
      'Foto profesional opcional',
    ],
    status: 'active',
    featured: true,
  },
  {
    slug: 'abogado-serio-consultas',
    title: 'Abogado serio orientado a consultas',
    shortDescription:
      'Sitio institucional breve para abogados o estudios jurídicos con áreas de práctica y contacto.',
    longDescription:
      'Template para profesionales legales que necesitan ordenar credibilidad, áreas de práctica y un camino claro hacia la consulta.',
    audience: ['legal'],
    format: 'institutional',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['legal', 'abogados', 'institucional', 'consultas'],
    screenshot: '/templates/abogado-serio-consultas.png',
    demoUrl: 'https://example.com/demo/abogado-serio-consultas',
    price: {
      amountARS: 240000,
      currency: 'ARS',
      kind: 'from',
    },
    deliveryDays: {
      min: 7,
      max: 14,
    },
    includedSections: [
      'Hero institucional',
      'Áreas de práctica',
      'Perfil profesional',
      'Proceso de consulta',
      'FAQ',
      'Contacto',
    ],
    requiredInputs: [
      'Nombre del profesional o estudio',
      'Áreas de práctica',
      'Matrícula o credenciales visibles si aplica',
      'Texto institucional',
      'Datos de contacto',
    ],
    status: 'active',
    featured: true,
  },
  {
    slug: 'consultor-premium-simple',
    title: 'Consultor premium simple',
    shortDescription:
      'Landing para consultores independientes que venden servicios de alto valor.',
    longDescription:
      'Template para explicar una propuesta profesional compleja de manera clara, con foco en credibilidad, casos de uso y llamada a consulta.',
    audience: ['consulting'],
    format: 'landing',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['consultoria', 'premium', 'landing', 'b2b'],
    screenshot: '/templates/consultor-premium-simple.png',
    demoUrl: 'https://example.com/demo/consultor-premium-simple',
    price: {
      amountARS: 220000,
      currency: 'ARS',
      kind: 'from',
    },
    deliveryDays: {
      min: 5,
      max: 12,
    },
    includedSections: [
      'Hero con posicionamiento',
      'Problemas que resuelve',
      'Servicios',
      'Credenciales',
      'Proceso de trabajo',
      'Contacto',
    ],
    requiredInputs: [
      'Propuesta de valor',
      'Servicios principales',
      'Credenciales',
      'Casos o ejemplos opcionales',
      'Datos de contacto',
    ],
    status: 'active',
    featured: false,
  },
] satisfies Template[];

export const templates = rawTemplates.map((template) =>
  templateSchema.parse(template),
);

export const activeTemplates = templates.filter(
  (template) => template.status === 'active',
);

export const featuredTemplates = activeTemplates.filter(
  (template) => template.featured,
);

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((template) => template.slug === slug);
}
