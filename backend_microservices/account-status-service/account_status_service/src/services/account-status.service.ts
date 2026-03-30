import { IAccountRepository } from '../repositories/account.repository';
import { IAuditService } from './audit.service';
import { INotificationService } from './notification.service';
import { IEventPublisher } from './event-publisher.service';
import { StatusUpdateRequest } from '../dtos/status-update-request.dto';
import { StatusUpdateResponse, CascadedCard } from '../dtos/status-update-response.dto';
import { AccountStatus, isValidTransition } from '../enums/account-status.enum';
import { AccountNotFoundException } from '../exceptions/account-not-found.exception';
import { InvalidTransitionException } from '../exceptions/invalid-transition.exception';
import { ConcurrentModificationException } from '../exceptions/concurrent-modification.exception';
import { logger } from '../utils/logger';

export interface IAccountStatusService {
  updateAccountStatus(
    accountId: string,
    request: StatusUpdateRequest,
    userId: string,
    ipAddress: string
  ): Promise<StatusUpdateResponse>;
}

export class AccountStatusService implements IAccountStatusService {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly auditService: IAuditService,
    private readonly notificationService: INotificationService,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async updateAccountStatus(
    accountId: string,
    request: StatusUpdateRequest,
    userId: string,
    ipAddress: string
  ): Promise<StatusUpdateResponse> {
    const { newStatus, reason, notes, notifyCustomer } = request;

    // 1. Fetch account
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundException(accountId);
    }

    const previousStatus = account.accountStatus;

    // 2. Validate status is different
    if (previousStatus === newStatus) {
      logger.warn('Attempted to set status to current value', {
        accountId,
        status: newStatus,
      });
      throw new Error('New status must be different from current status');
    }

    // 3. Validate transition is allowed
    if (!isValidTransition(previousStatus, newStatus)) {
      throw new InvalidTransitionException(accountId, previousStatus, newStatus);
    }

    // 4. Get cards before status change
    const cardsBefore = await this.accountRepository.getAccountCards(accountId);
    const cascadedCards: CascadedCard[] = [];

    const effectiveDate = new Date();

    try {
      // 5. Update account status with optimistic locking
      const updated = await this.accountRepository.updateStatus(
        accountId,
        newStatus,
        userId,
        account.version
      );

      if (!updated) {
        throw new ConcurrentModificationException(accountId);
      }

      // 6. Create status history record
      await this.accountRepository.createStatusHistory({
        accountId,
        previousStatus,
        newStatus,
        reasonCode: reason,
        notes: notes || null,
        changedAt: effectiveDate,
        changedBy: userId,
        notifyCustomer,
        ipAddress,
      });

      // 7. Cascade status to cards if appropriate
      if (
        newStatus === AccountStatus.INACTIVE ||
        newStatus === AccountStatus.SUSPENDED
      ) {
        const cardsUpdated = await this.accountRepository.cascadeCardsStatus(
          accountId,
          newStatus
        );

        logger.info('Cascaded status to associated cards', {
          accountId,
          cardsUpdated,
          newStatus,
        });

        // Build cascaded cards response
        for (const card of cardsBefore) {
          cascadedCards.push({
            cardNumber: this.maskCardNumber(card.cardNumber),
            previousStatus: card.status,
            newStatus: newStatus,
          });
        }
      }

      // 8. Publish event to Kafka
      await this.eventPublisher.publishAccountStatusChanged({
        accountId,
        previousStatus,
        newStatus,
        reason,
        effectiveDate,
        updatedBy: userId,
      });

      // 9. Check if account closed with balance
      if (newStatus === AccountStatus.INACTIVE && account.balance > 0) {
        await this.eventPublisher.publishAccountClosedWithBalance({
          accountId,
          balance: account.balance,
          closedDate: effectiveDate,
          closedBy: userId,
        });

        logger.warn('Account closed with outstanding balance', {
          accountId,
          balance: account.balance,
        });
      }

      // 10. Send notification if requested
      let notificationSent = false;
      if (notifyCustomer) {
        notificationSent = await this.notificationService.sendStatusChangeNotification({
          accountId,
          previousStatus,
          newStatus,
          reason,
          effectiveDate,
        });
      }

      // 11. Audit log
      this.auditService.logStatusChange({
        eventType: 'ACCOUNT_STATUS_CHANGED',
        accountId,
        userId,
        action: 'UPDATE_STATUS',
        previousValue: previousStatus,
        newValue: newStatus,
        reason,
        success: true,
        metadata: {
          cascadedCards: cascadedCards.length,
          notificationSent,
        },
      });

      // 12. Return response
      return {
        accountId,
        previousStatus,
        newStatus,
        reason,
        effectiveDate,
        updatedBy: userId,
        cascadedCards,
        notificationSent,
      };
    } catch (error) {
      // Audit failure
      this.auditService.logFailure(accountId, 'Status change failed', error as Error);
      throw error;
    }
  }

  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 4) return '****';
    return '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
  }
}
