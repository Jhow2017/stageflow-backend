export abstract class MercadoPagoWebhookEventsRepository {
    abstract existsByResourceIdAndTopic(resourceId: string, topic: string): Promise<boolean>;
    abstract create(input: { resourceId: string; topic: string; payload: unknown }): Promise<void>;
}
