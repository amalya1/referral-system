import { IEvent } from '@nestjs/cqrs';
import { User } from '@domain/models/user.model';

export class UserCreatedEvent implements IEvent {
  readonly type = 'UserCreatedEvent';
  readonly timestamp: Date;

  constructor(public readonly user: User) {
    this.timestamp = new Date();
  }
}
