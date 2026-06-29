import type { Order, OrderBrief } from '@/contracts/order';

type BriefTextField = keyof Pick<
  OrderBrief,
  'businessName' | 'industry' | 'goal'
>;

const briefCompletenessFields: Array<{
  key: BriefTextField;
  label: string;
}> = [
  { key: 'businessName', label: 'Nombre del negocio o profesional' },
  { key: 'industry', label: 'Rubro o industria' },
  { key: 'goal', label: 'Objetivo del sitio' },
];

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getBriefMissingFields(order: Order): string[] {
  return briefCompletenessFields
    .filter(({ key }) => !hasText(order.brief[key]))
    .map(({ label }) => label);
}

export function isOrderBriefComplete(order: Order): boolean {
  return getBriefMissingFields(order).length === 0;
}
