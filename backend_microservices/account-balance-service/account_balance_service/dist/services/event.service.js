"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class EventService {
    producer;
    constructor(producer) {
        this.producer = producer;
    }
    async publishBalanceUpdated(event) {
        try {
            await this.producer.send({
                topic: config_1.config.kafka.topicBalanceUpdated,
                messages: [
                    {
                        key: event.accountId,
                        value: JSON.stringify(event),
                        timestamp: new Date(event.timestamp).getTime().toString(),
                    },
                ],
            });
            logger_1.logger.info({ accountId: event.accountId }, 'Published BalanceUpdated event');
        }
        catch (error) {
            logger_1.logger.error({ error, accountId: event.accountId }, 'Failed to publish BalanceUpdated event');
            throw error;
        }
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map