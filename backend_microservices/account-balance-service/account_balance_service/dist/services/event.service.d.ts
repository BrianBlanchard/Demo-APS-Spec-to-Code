import { Producer } from 'kafkajs';
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
export declare class EventService implements IEventService {
    private readonly producer;
    constructor(producer: Producer);
    publishBalanceUpdated(event: BalanceUpdatedEvent): Promise<void>;
}
//# sourceMappingURL=event.service.d.ts.map