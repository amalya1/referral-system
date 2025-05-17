import { IQuery } from '@nestjs/cqrs';
import { User } from '@domain/models/user.model';

export class GetUserProfileQuery implements IQuery {
  readonly type = 'GetUserProfileQuery';

  constructor(public readonly userId: string) {}
}

export type GetUserProfileQueryResult = User;
