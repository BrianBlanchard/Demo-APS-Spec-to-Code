import { Knex } from 'knex';
import { User, UserStatus, SuspensionReason } from '../models/types';
import { UserNotFoundError, DatabaseError } from '../utils/errors';
import { logger } from '../config/logger';

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  updateUserStatus(
    userId: string,
    status: UserStatus,
    suspensionReason: SuspensionReason | null,
    suspensionNotes: string | null,
    suspensionExpiresAt: Date | null
  ): Promise<User>;
  invalidateUserSessions(userId: string): Promise<void>;
  hideUserListings(userId: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  private readonly tableName = 'users';

  constructor(private readonly db: Knex) {}

  async findById(userId: string): Promise<User | null> {
    try {
      const user = await this.db<User>(this.tableName).where({ user_id: userId }).first();
      return user || null;
    } catch (error) {
      logger.error({ error, userId }, 'Error finding user by ID');
      throw new DatabaseError('Failed to retrieve user from database');
    }
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    suspensionReason: SuspensionReason | null,
    suspensionNotes: string | null,
    suspensionExpiresAt: Date | null
  ): Promise<User> {
    try {
      const updatedUsers = await this.db<User>(this.tableName)
        .where({ user_id: userId })
        .update({
          status,
          suspension_reason: suspensionReason,
          suspension_notes: suspensionNotes,
          suspension_expires_at: suspensionExpiresAt,
          updated_at: this.db.fn.now(),
        })
        .returning('*');

      if (!updatedUsers || updatedUsers.length === 0) {
        throw new UserNotFoundError(userId);
      }

      return updatedUsers[0];
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      logger.error({ error, userId }, 'Error updating user status');
      throw new DatabaseError('Failed to update user status');
    }
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      // Placeholder: Invalidate sessions in sessions table
      await this.db('user_sessions').where({ user_id: userId }).delete();
      logger.info({ userId }, 'User sessions invalidated');
    } catch (error) {
      logger.error({ error, userId }, 'Error invalidating user sessions');
      // Non-critical operation, log but don't throw
    }
  }

  async hideUserListings(userId: string): Promise<void> {
    try {
      // Placeholder: Hide listings in listings table
      await this.db('user_listings')
        .where({ user_id: userId })
        .update({ is_hidden: true, updated_at: this.db.fn.now() });
      logger.info({ userId }, 'User listings hidden');
    } catch (error) {
      logger.error({ error, userId }, 'Error hiding user listings');
      // Non-critical operation, log but don't throw
    }
  }
}
