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
    bestFor: 'Profesionales independientes que necesitan confianza, claridad y una vía directa a primera consulta.',
    primaryGoal: 'Convertir visitas en consultas o reservas de entrevista inicial.',
    complexity: 'simple',
    recommendedFor: [
      'Psicólogos, terapeutas y profesionales de salud mental con servicios definidos',
      'Consultorios que ya tienen datos de contacto, modalidad de atención y agenda',
      'Profesionales que buscan presencia online sobria sin vender múltiples productos',
    ],
    notIdealFor: [
      'Clínicas con muchas sedes, equipos grandes o necesidades de turnos complejos',
      'Marcas que todavía no definieron enfoque, servicios ni tono profesional',
    ],
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
    bestFor: 'Profesionales o pequeños equipos que combinan autoridad institucional, formación y consultas.',
    primaryGoal: 'Presentar cursos, talleres y servicios para generar consultas calificadas.',
    complexity: 'standard',
    recommendedFor: [
      'Consultores, docentes o especialistas con varias líneas de servicio',
      'Profesionales que ofrecen talleres, seminarios y consultas individuales',
      'Marcas que necesitan explicar una disciplina antes de recibir consultas',
    ],
    notIdealFor: [
      'Negocios que necesitan ecommerce, carrito o inscripción automática avanzada',
      'Proyectos con una sola oferta simple que funcionaría mejor como landing corta',
    ],
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

  {
    slug: 'abogado-estudio-profesional',
    title: 'Abogado o estudio profesional',
    shortDescription:
      'Sitio institucional para estudios jurídicos con áreas de práctica, perfil profesional, consultas y contacto claro.',
    longDescription:
      'Template candidato para abogados independientes o estudios pequeños que necesitan explicar especialidades, transmitir confianza y derivar consultas calificadas por WhatsApp o email.',
    audience: ['legal', 'consulting'],
    format: 'institutional',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['legal', 'abogados', 'estudio-juridico', 'consultas', 'institucional'],
    bestFor: 'Abogados o estudios pequeños con áreas de práctica definidas y necesidad de consultas calificadas.',
    primaryGoal: 'Presentar especialidades legales y convertir visitas en contactos de consulta.',
    complexity: 'standard',
    recommendedFor: [
      'Profesionales legales que quieren una presencia sobria y confiable',
      'Estudios con dos a cinco áreas de práctica principales',
      'Servicios que requieren explicar proceso, criterios y canales de consulta',
    ],
    notIdealFor: [
      'Portales legales con login, expedientes o gestión documental privada',
      'Estudios que necesitan publicar novedades legales con frecuencia de medio editorial',
    ],
    screenshot: '/templates/formacion-cursos-consultas.png',
    demoUrl: 'https://example.com/templates/abogado-estudio-profesional',
    price: {
      amountARS: 260000,
      currency: 'ARS',
      kind: 'from',
    },
    deliveryDays: {
      min: 7,
      max: 14,
    },
    includedSections: [
      'Hero institucional con propuesta profesional',
      'Áreas de práctica o servicios legales',
      'Perfil del abogado o equipo',
      'Proceso de consulta',
      'Preguntas frecuentes legales generales',
      'Contacto por WhatsApp/email',
    ],
    requiredInputs: [
      'Nombre del profesional o estudio',
      'Matrícula o credenciales públicas si corresponde',
      'Áreas de práctica principales',
      'Bio profesional o perfil del equipo',
      'Datos de contacto',
      'Textos legales o disclaimers requeridos',
    ],
    status: 'draft',
    featured: false,
  },
  {
    slug: 'consultor-data-ai',
    title: 'Consultor de datos e IA',
    shortDescription:
      'Landing consultiva para especialistas en datos, automatización o IA con servicios, casos de uso y llamada a diagnóstico.',
    longDescription:
      'Template candidato para consultores técnicos que necesitan explicar valor de negocio, ordenar servicios complejos y orientar a potenciales clientes hacia una primera reunión de diagnóstico.',
    audience: ['consulting'],
    format: 'landing',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['consultoria', 'datos', 'ia', 'automatizacion', 'b2b'],
    bestFor: 'Consultores independientes o boutiques B2B que venden diagnóstico, automatización y estrategia de datos.',
    primaryGoal: 'Convertir interés técnico en reuniones de diagnóstico con contexto suficiente.',
    complexity: 'standard',
    recommendedFor: [
      'Consultores con servicios B2B claros y ejemplos de problemas que resuelven',
      'Especialistas que necesitan traducir tecnología a beneficios de negocio',
      'Ofertas de diagnóstico, roadmap, automatización o implementación liviana',
    ],
    notIdealFor: [
      'SaaS con producto self-service, pricing dinámico o onboarding dentro del sitio',
      'Consultorías sin casos de uso, verticales o promesa de valor definida',
    ],
    screenshot: '/templates/psicologo-clinico-agenda.png',
    demoUrl: 'https://example.com/templates/consultor-data-ai',
    price: {
      amountARS: 280000,
      currency: 'ARS',
      kind: 'from',
    },
    deliveryDays: {
      min: 7,
      max: 14,
    },
    includedSections: [
      'Hero con propuesta B2B',
      'Problemas que resuelve',
      'Servicios o paquetes de consultoría',
      'Casos de uso o resultados esperados',
      'Proceso de trabajo',
      'CTA a diagnóstico',
    ],
    requiredInputs: [
      'Descripción de servicios principales',
      'Perfil del consultor o equipo',
      'Sectores o clientes objetivo',
      'Casos de uso o ejemplos permitidos',
      'Datos de contacto y agenda',
      'Referencias visuales o tono de marca',
    ],
    status: 'draft',
    featured: false,
  },
  {
    slug: 'clinica-salud-local',
    title: 'Clínica de salud local',
    shortDescription:
      'Sitio institucional para clínicas, centros médicos o consultorios con especialidades, equipo, ubicación y turnos.',
    longDescription:
      'Template candidato para organizaciones de salud locales que necesitan ordenar especialidades, profesionales, datos de atención y canales de reserva sin implementar un sistema complejo de turnos.',
    audience: ['health', 'local_business'],
    format: 'institutional',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['salud', 'clinica', 'turnos', 'local', 'institucional'],
    bestFor: 'Centros de salud locales que necesitan explicar especialidades, ubicación y canales de turno.',
    primaryGoal: 'Ayudar a pacientes a entender la oferta y solicitar turnos por canales existentes.',
    complexity: 'advanced',
    recommendedFor: [
      'Clínicas pequeñas con especialidades y horarios definidos',
      'Consultorios con varios profesionales y ubicación física',
      'Centros que ya gestionan turnos por teléfono, WhatsApp o agenda externa',
    ],
    notIdealFor: [
      'Instituciones que necesitan historia clínica, login de pacientes o turnos nativos',
      'Equipos sin información validada de profesionales, horarios y especialidades',
    ],
    screenshot: '/templates/psicologo-clinico-agenda.png',
    demoUrl: 'https://example.com/templates/clinica-salud-local',
    price: {
      amountARS: 320000,
      currency: 'ARS',
      kind: 'from',
    },
    deliveryDays: {
      min: 10,
      max: 18,
    },
    includedSections: [
      'Hero institucional de salud',
      'Especialidades y servicios',
      'Equipo profesional',
      'Información de turnos',
      'Ubicación y horarios',
      'Contacto por canales existentes',
    ],
    requiredInputs: [
      'Nombre de clínica o centro',
      'Especialidades disponibles',
      'Listado de profesionales y credenciales públicas',
      'Horarios, dirección y canales de turno',
      'Fotos del espacio o equipo',
      'Textos legales o sanitarios requeridos',
    ],
    status: 'draft',
    featured: false,
  },
  {
    slug: 'restaurant-reservas-simple',
    title: 'Restaurant con reservas simples',
    shortDescription:
      'Landing para restaurantes con propuesta gastronómica, menú destacado, ubicación, horarios y reservas por WhatsApp.',
    longDescription:
      'Template candidato para restaurantes, cafés o bares que necesitan presencia clara, fotos atractivas, menú resumido y derivación a reserva sin implementar un motor gastronómico completo.',
    audience: ['restaurant', 'local_business'],
    format: 'landing',
    stack: ['nextjs', 'tailwind', 'static_export'],
    tags: ['restaurant', 'gastronomia', 'reservas', 'menu', 'local'],
    bestFor: 'Locales gastronómicos que quieren mostrar propuesta, horarios, ubicación y reservas por WhatsApp.',
    primaryGoal: 'Convertir visitas en reservas o consultas rápidas sobre menú y disponibilidad.',
    complexity: 'simple',
    recommendedFor: [
      'Restaurantes, cafés o bares con carta estable y buenas fotos',
      'Locales que gestionan reservas por WhatsApp, teléfono o plataforma externa',
      'Propuestas gastronómicas que necesitan comunicar ambiente y ubicación',
    ],
    notIdealFor: [
      'Delivery con carrito, pagos online o múltiples sucursales con stock',
      'Locales sin fotos, menú actualizado ni horarios confirmados',
    ],
    screenshot: '/templates/formacion-cursos-consultas.png',
    demoUrl: 'https://example.com/templates/restaurant-reservas-simple',
    price: {
      amountARS: 220000,
      currency: 'ARS',
      kind: 'from',
    },
    deliveryDays: {
      min: 5,
      max: 10,
    },
    includedSections: [
      'Hero gastronómico con foto principal',
      'Propuesta o historia del lugar',
      'Menú destacado',
      'Galería breve',
      'Horarios y ubicación',
      'Reserva por WhatsApp o link externo',
    ],
    requiredInputs: [
      'Nombre del local y propuesta gastronómica',
      'Menú o platos destacados',
      'Fotos del espacio y comida',
      'Dirección, horarios y datos de contacto',
      'Link de reservas si existe',
      'Redes sociales activas',
    ],
    status: 'draft',
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
