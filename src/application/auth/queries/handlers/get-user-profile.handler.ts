import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetUserProfileQuery } from '@application/auth/queries/impl/get-user-profile.query';
import { UserStore } from '@infrastructure/stores/user.store';
import { User } from '@domain/models/user.model';
import { LoggerService } from '@libs/logger/src/logger.service';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery> {
  constructor(
    private readonly userStore: UserStore,
    private readonly logger: LoggerService,
  ) {}

  async execute(query: GetUserProfileQuery): Promise<Partial<User>> {
    this.logger.debug(`Fetching user profile for ID: ${query.userId}`, { userId: query.userId });

    const user = await this.userStore.findById(query.userId);

    if (!user) {
      this.logger.warn(`User not found with ID: ${query.userId}`, { userId: query.userId });
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }

    this.logger.debug(`Successfully retrieved user profile for ID: ${query.userId}`, { userId: query.userId });
    return user.toJSON();
  }
}
