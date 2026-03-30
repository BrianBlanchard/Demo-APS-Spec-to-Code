import { IUserRepository } from '../repositories/userRepository';
import { IAuditService } from './auditService';
import { SuspendUserRequest, SuspendUserResponse } from '../models/dtos';
import { UserStatus, AdminAction, SuspensionReason } from '../models/types';
import { UserNotFoundError, UserAlreadySuspendedError } from '../utils/errors';
import { logger } from '../config/logger';
import { getContext } from '../middlewares/context';

export interface IUserService {
  suspendUser(userId: string, request: SuspendUserRequest): Promise<SuspendUserResponse>;
}

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditService: IAuditService
  ) {}

  async suspendUser(userId: string, request: SuspendUserRequest): Promise<SuspendUserResponse> {
    const context = getContext();
    logger.info({ userId, traceId: context?.traceId }, 'Suspending user account');

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Check if user is already suspended
    if (user.status === UserStatus.SUSPENDED) {
      throw new UserAlreadySuspendedError(userId);
    }

    // Calculate suspension expiration date
    const suspensionExpiresAt = request.duration_days
      ? new Date(Date.now() + request.duration_days * 24 * 60 * 60 * 1000)
      : null;

    // Update user status
    await this.userRepository.updateUserStatus(
      userId,
      UserStatus.SUSPENDED,
      request.suspension_reason,
      request.suspension_notes,
      suspensionExpiresAt
    );

    // Invalidate all active sessions
    await this.userRepository.invalidateUserSessions(userId);

    // Hide user's active listings
    await this.userRepository.hideUserListings(userId);

    // Send suspension notification email (placeholder)
    if (request.notify_user) {
      await this.sendSuspensionNotification(userId, request.suspension_reason, suspensionExpiresAt);
    }

    // Log admin action in audit trail
    await this.auditService.logAdminAction(AdminAction.SUSPEND_USER, userId, {
      suspension_reason: request.suspension_reason,
      suspension_notes: request.suspension_notes,
      duration_days: request.duration_days,
      notify_user: request.notify_user,
      suspended_until: suspensionExpiresAt?.toISOString() || null,
    });

    logger.info({ userId, suspensionExpiresAt }, 'User account suspended successfully');

    return {
      success: true,
      message: 'User account has been suspended',
      user_id: userId,
      suspended_until: suspensionExpiresAt,
    };
  }

  private async sendSuspensionNotification(
    userId: string,
    reason: SuspensionReason,
    expiresAt: Date | null
  ): Promise<void> {
    // Placeholder for email notification service integration
    logger.info(
      { userId, reason, expiresAt },
      'Suspension notification sent (placeholder implementation)'
    );
  }
}
