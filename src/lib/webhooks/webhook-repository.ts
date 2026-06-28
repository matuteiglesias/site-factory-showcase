import type { WebhookEvent } from '@/contracts/webhook';

export type CreateWebhookEventInput = {
  providerEventId?: string;
  topic?: string;
  action?: string;
  dataId?: string;
  xRequestId?: string;
  xSignature?: string;
  rawBody: unknown;
  processingStatus?: WebhookEvent['processingStatus'];
  processingError?: string;
};

export type MarkWebhookEventProcessedInput = {
  webhookEventId: string;
  processingStatus: WebhookEvent['processingStatus'];
  processingError?: string;
};

export interface WebhookEventRepository {
  create(input: CreateWebhookEventInput): Promise<WebhookEvent>;
  markProcessed(
    input: MarkWebhookEventProcessedInput,
  ): Promise<WebhookEvent | undefined>;
  listByOrderPublicId(orderPublicId: string): Promise<WebhookEvent[]>;
}
