'use client';

import { useEffect } from 'react';

import {
  type AnalyticsEventName,
  type AnalyticsEventPayload,
  trackAnalyticsEvent,
} from '@/lib/analytics/events';

type Props = {
  name: AnalyticsEventName;
  payload?: AnalyticsEventPayload;
};

export default function TrackOnView({ name, payload }: Props) {
  useEffect(() => {
    trackAnalyticsEvent({ name, payload });
  }, [name, payload]);

  return null;
}
