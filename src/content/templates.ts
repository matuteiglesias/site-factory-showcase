import { templateSchema, type Template } from '@/contracts/template';

const rawTemplates = [
  {
    slug: 'psicologo-clinico-agenda',
    title: 'Psicólogo clínico con agenda online',
    shortDescription:
      'Landing profesional para psicólogos con enfoque clínico, servicios, sobre mí, contacto, WhatsApp y reserva de entrevista.',
    longDescription:
      'Template basado en un sitio real para atención psicológica. Está pensado para profesionales de salud mental que necesitan transmitir confianza, explicar su enfoque de trabajo y facilitar una primera consulta o reserva de entrevista.',
    audience: ['psychology', 'health'],
    format: 'landing',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['psicologia', 'salud', 'agenda', 'landing', 'servicios-profesionales'],
    screenshot: '/templates/psicologo-clinico-agenda.png',
    demoUrl: 'https://maydana-psicologo.vercel.app/',
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
      'Hero con posicionamiento profesional',
      'Cuándo consultar',
      'Enfoque terapéutico',
      'Modalidades de trabajo',
      'Sobre mí / experiencia',
      'Contacto, WhatsApp y agenda',
    ],
    requiredInputs: [
      'Nombre profesional',
      'Matrícula o credenciales si corresponde',
      'Texto de presentación',
      'Modalidades de atención',
      'Servicios o problemáticas que aborda',
      'Email, WhatsApp y link de agenda',
      'Foto profesional o imágenes de apoyo',
    ],
    status: 'active',
    featured: true,
  },
  {
    slug: 'formacion-cursos-consultas',
    title: 'Formación, cursos y consultas profesionales',
    shortDescription:
      'Sitio institucional para profesionales que ofrecen cursos, talleres, análisis, divulgación y consultas por WhatsApp.',
    longDescription:
      'Template basado en un sitio real de grafología y neuroescritura. Sirve para profesionales o pequeños negocios que combinan formación, servicios de análisis, talleres, seminarios y contenidos de divulgación.',
    audience: ['education', 'consulting'],
    format: 'institutional',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['educacion', 'cursos', 'talleres', 'consultoria', 'institucional'],
    screenshot: '/templates/formacion-cursos-consultas.png',
    demoUrl: 'https://grafoescrito.vercel.app/',
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
      'Presentación de disciplina o propuesta',
      'Áreas de trabajo',
      'Caminos de formación',
      'Talleres y seminarios',
      'Sobre el profesional',
      'Recursos o temas de divulgación',
      'Contacto por WhatsApp/email',
    ],
    requiredInputs: [
      'Nombre de marca o profesional',
      'Descripción de la actividad',
      'Cursos o servicios principales',
      'Talleres o seminarios disponibles',
      'Bio profesional',
      'Datos de contacto',
      'Fotos o imágenes de apoyo',
    ],
    status: 'active',
    featured: true,
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
