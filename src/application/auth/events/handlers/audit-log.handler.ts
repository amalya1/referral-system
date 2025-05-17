import { IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UserCreatedEvent } from '@application/auth/events/impl/user-created.event';
import { UserLoggedInEvent } from '@application/auth/events/impl/user-logged-in.event';
import { LoggerService } from '@libs/logger/src/logger.service';

@Injectable()
export class UserCreatedAuditHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly logger: LoggerService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    try {
      const user = event.user;
      this.logger.info(`User created - ID: ${user.id}, Email: ${user.email}`, { userId: user.id });
      // In a real application, this would save to an audit database
    } catch (error) {
      this.logger.error(`Failed to log user creation event`, error, { userId: event.user.id });
    }
  }
}

@Injectable()
export class UserLoggedInAuditHandler implements IEventHandler<UserLoggedInEvent> {
  constructor(private readonly logger: LoggerService) {}

  async handle(event: UserLoggedInEvent): Promise<void> {
    try {
      const user = event.user;
      this.logger.info(`User logged in - Email: ${user.email}`, { userId: user.id });
      // In a real application, this would save to an audit database
    } catch (error) {
      this.logger.error(`Failed to log user login event`, error, { userId: event.user.id });
    }
  }
}