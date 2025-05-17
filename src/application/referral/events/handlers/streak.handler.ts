import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { DailyStreakUpdateTriggeredEvent} from "@application/referral/events/impl/daily-streak-update-triggered.event";
import {StreakService} from "@application/referral/services/streak.service";
import {LoggerService} from "@libs/logger/src/logger.service";

@EventsHandler(DailyStreakUpdateTriggeredEvent)
export class StreakHandler implements IEventHandler<DailyStreakUpdateTriggeredEvent> {
    constructor(
        private readonly streakService: StreakService,
        private readonly logger: LoggerService,
    ) {}

    async handle(): Promise<void> {
        this.logger.debug('Updating streak for users');
        try {
            await this.streakService.updateUsersStreak();
        } catch (error) {
            this.logger.error('Failed to update streak for users.', error);

        }
    }
}