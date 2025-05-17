import { IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { WelcomeEmailRequiredEvent } from '@application/auth/events/impl/welcome-email-required.event';
import { LoggerService } from '@libs/logger/src/logger.service';

@Injectable()
export class EmailNotificationHandler implements IEventHandler<WelcomeEmailRequiredEvent> {
  constructor(private readonly logger: LoggerService) {}

  async handle(event: WelcomeEmailRequiredEvent): Promise<void> {
    try {
      const { email, firstName } = event.user;
      this.logger.debug(`Preparing welcome email for user: ${email}`, { email });

      // В реальном приложении здесь будет интеграция с email сервисом
      // Например:
      // await this.emailService.sendWelcomeEmail({
      //   to: email,
      //   firstName,
      //   template: 'welcome-email',
      //   data: { firstName }
      // });

      this.logger.info(`Welcome email sent successfully to: ${email}`, { email });
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${event.user.email}`,
        error,
        { email: event.user.email }
      );
      // В реальном приложении здесь можно добавить повторную попытку отправки
      // или поместить событие в очередь для последующей обработки
    }
  }
}