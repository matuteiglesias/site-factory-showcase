'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

import {
  type AnalyticsEventName,
  type AnalyticsEventPayload,
  trackAnalyticsEvent,
} from '@/lib/analytics/events';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  eventName: AnalyticsEventName;
  eventPayload?: AnalyticsEventPayload;
};

export default function TrackedExternalLink({
  children,
  eventName,
  eventPayload,
  onClick,
  ...props
}: Props) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackAnalyticsEvent({ name: eventName, payload: eventPayload });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
