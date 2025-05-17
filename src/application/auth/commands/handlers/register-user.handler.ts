import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserCommand } from '@application/auth/commands/impl/register-user.command';
import { UserCreatedEvent } from '@application/auth/events/impl/user-created.event';
import { WelcomeEmailRequiredEvent } from '@application/auth/events/impl/welcome-email-required.event';
import { AuthService } from '@application/auth/services/auth.service';
import { UserStore } from '@infrastructure/stores/user.store';
import { AuthResponse } from '@libs/shared/dto/auth';
import { LoggerService } from '@libs/logger/src/logger.service';
import {ReferralAppliedEvent} from "@application/referral/events/impl/referral-applied.event";

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly userStore: UserStore,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResponse> {
    this.logger.debug('Handling RegisterUserCommand', { email: command.email });

    try {
      const { user: userDto, ...response } = await this.authService.register({
        email: command.email,
        password: command.password,
        firstName: command.firstName,
        lastName: command.lastName,
        referralCode: command.referralCode,
      });

      // Get full user model for UserCreatedEvent
      const user = await this.userStore.findById(userDto.id);
      if (!user) {
        throw new Error('User not found after registration');
      }

      // Update last login time
      user.updateLastLogin();
      await this.userStore.save(user);

      // Publish events
      this.eventBus.publish(new UserCreatedEvent(user));

      if (command.referralCode) {
        this.eventBus.publish(new ReferralAppliedEvent(user, command.referralCode));
      }

      this.eventBus.publish(new WelcomeEmailRequiredEvent(user));

      this.logger.debug('User registration completed', { userId: user.id });
      return { ...response, user: userDto };
    } catch (error) {
      this.logger.error('Failed to register user', error, { email: command.email });
      throw error;
    }
  }
}
