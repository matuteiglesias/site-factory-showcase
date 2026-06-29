import { z } from 'zod';

export const templateFormats = [
  'landing',
  'institutional',
  'docs',
  'portfolio',
] as const;

export const templateStatuses = ['active', 'draft', 'archived'] as const;

export const templateAudiences = [
  'psychology',
  'legal',
  'consulting',
  'local_business',
  'education',
  'health',
  'restaurant',
  'portfolio',
] as const;

export const templateStackItems = [
  'nextjs',
  'docusaurus',
  'tailwind',
  'css_modules',
  'static_export',
] as const;

export const templateSlugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const templateSchema = z.object({
  slug: templateSlugSchema,
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(10).max(240),
  longDescription: z.string().min(10).max(2000),

  audience: z.array(z.enum(templateAudiences)).min(1),
  format: z.enum(templateFormats),
  stack: z.array(z.enum(templateStackItems)).min(1),
  tags: z.array(z.string().min(2)).default([]),

  bestFor: z.string().min(3).max(180),
  primaryGoal: z.string().min(3).max(160),
  complexity: z.enum(['simple', 'standard', 'advanced']),
  recommendedFor: z.array(z.string().min(3)).min(1),
  notIdealFor: z.array(z.string().min(3)).min(1),

  screenshot: z.string().min(1),
  demoUrl: z.string().url(),

  price: z.object({
    amountARS: z.number().int().positive(),
    currency: z.literal('ARS'),
    kind: z.enum(['fixed', 'from']).default('from'),
  }),

  deliveryDays: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),

  includedSections: z.array(z.string().min(2)).min(1),
  requiredInputs: z.array(z.string().min(2)).min(1),

  status: z.enum(templateStatuses),
  featured: z.boolean().default(false),
});

export type TemplateFormat = (typeof templateFormats)[number];
export type TemplateStatus = (typeof templateStatuses)[number];
export type TemplateAudience = (typeof templateAudiences)[number];
export type TemplateStackItem = (typeof templateStackItems)[number];
export type TemplateSlug = z.infer<typeof templateSlugSchema>;
export type Template = z.infer<typeof templateSchema>;

export function assertActiveTemplate(template: Template): Template {
  if (template.status !== 'active') {
    throw new Error(`Template "${template.slug}" is not active`);
  }
  return template;
}
