import { templateSchema, type Template } from '@/contracts/template';
import { rawTemplates } from './template-data';

export const templates: Template[] = rawTemplates.map((template) =>
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