import { IEvent } from '@nestjs/cqrs';
import { User } from '@domain/models/user.model';

export class WelcomeEmailRequiredEvent implements IEvent {
  readonly type = 'WelcomeEmailRequiredEvent';
  readonly timestamp: Date;

  constructor(
    public readonly user: User,
  ) {
    this.timestamp = new Date();
  }
}
