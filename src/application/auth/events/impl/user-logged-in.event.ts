import { IEvent } from '@nestjs/cqrs';
import { User } from '@domain/models/user.model';

export class UserLoggedInEvent implements IEvent {
  readonly type = 'UserLoggedInEvent';
  readonly timestamp: Date;

  constructor(
    public readonly user: User,
  ) {
    this.timestamp = new Date();
  }
}
