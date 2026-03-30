import { Producer } from 'kafkajs';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface BalanceUpdatedEvent {
  accountId: string;
  previousBalance: number;
  newBalance: number;
  transactionId: string;
  timestamp: string;
}

export interface IEventService {
  publishBalanceUpdated(event: BalanceUpdatedEvent): Promise<void>;
}

export class EventService implements IEventService {
  constructor(private readonly producer: Producer) {}

  async publishBalanceUpdated(event: BalanceUpdatedEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: config.kafka.topicBalanceUpdated,
        messages: [
          {
            key: event.accountId,
            value: JSON.stringify(event),
            timestamp: new Date(event.timestamp).getTime().toString(),
          },
        ],
      });

      logger.info({ accountId: event.accountId }, 'Published BalanceUpdated event');
    } catch (error) {
      logger.error({ error, accountId: event.accountId }, 'Failed to publish BalanceUpdated event');
      throw error;
    }
  }
}
