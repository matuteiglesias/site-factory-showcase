export const analyticsEvents = [
  'template_list_viewed',
  'template_filter_used',
  'template_detail_viewed',
  'template_demo_clicked',
  'order_form_started',
  'order_form_submitted',
] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[number];
export type AnalyticsEventPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

type AnalyticsEvent = {
  name: AnalyticsEventName;
  payload?: AnalyticsEventPayload;
};

export function trackAnalyticsEvent({ name, payload }: AnalyticsEvent) {
  if (process.env.NODE_ENV !== 'development') return;

  console.info('[analytics:event]', name, payload ?? {});
}
