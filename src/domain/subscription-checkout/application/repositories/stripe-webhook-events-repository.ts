export abstract class StripeWebhookEventsRepository {
    abstract existsByEventId(eventId: string): Promise<boolean>;
    abstract create(data: {
        eventId: string;
        eventType: string;
        payload?: Record<string, unknown> | null;
    }): Promise<void>;
}
