import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from '@application/auth/commands/impl/login-user.command';
import { UserStore } from '@infrastructure/stores/user.store';
import { AuthResponse } from '@libs/shared/dto/auth';
import { AuthService } from '@application/auth/services/auth.service';
import { LoggerService } from '@libs/logger/src/logger.service';
import { UserLoggedInEvent } from '@application/auth/events/impl/user-logged-in.event';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly userStore: UserStore,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthResponse> {
    this.logger.debug('Handling LoginUserCommand', { email: command.email });

    try {
      const response = await this.authService.login({
        email: command.email,
        password: command.password,
      });

      // Get full user model for UserLoggedInEvent
      const user = await this.userStore.findById(response.user.id);
      if (!user) {
        throw new Error('User not found after login');
      }

      // Publish event
      this.eventBus.publish(new UserLoggedInEvent(user));

      this.logger.debug('User logged in successfully', { userId: response.user.id });
      return response;
    } catch (error) {
      this.logger.error('Failed to login user', error, { email: command.email });
      throw error;
    }
  }
}
