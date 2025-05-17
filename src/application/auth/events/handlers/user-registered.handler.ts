import { IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UserRegisteredEvent } from '@application/auth/events/impl/user-registered.event';

@Injectable()
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  async handle(event: UserRegisteredEvent): Promise<void> {
    // Здесь может быть логика для:
    // - Отправки приветственного email
    // - Создания стандартного workspace для пользователя
    // - Логирования события
    // - Обновления аналитики
    console.log(`User registered: ${event.user.email}`);
  }
}
