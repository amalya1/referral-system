import { IEvent } from '@nestjs/cqrs';
import { User } from '@domain/models/user.model';

export class UserRegisteredEvent implements IEvent {
  readonly type = 'UserRegisteredEvent';
  readonly timestamp: Date;

  constructor(
    public readonly user: User,
  ) {
    this.timestamp = new Date();
  }
}
