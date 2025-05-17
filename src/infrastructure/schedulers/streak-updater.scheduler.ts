import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {LoggerService} from "@libs/logger/src/logger.service";
import {EventBus} from "@nestjs/cqrs";
import {DailyStreakUpdateTriggeredEvent} from "@application/referral/events/impl/daily-streak-update-triggered.event";

@Injectable()
export class StreakUpdaterScheduler {
    constructor(
        private readonly logger: LoggerService,
        private readonly eventBus: EventBus,
     ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.debug('StreakUpdaterScheduler started.');

        try {
            this.eventBus.publish(new DailyStreakUpdateTriggeredEvent());
            this.logger.debug('All streaks updated successfully.');
        } catch (error) {
            this.logger.error('Error while updating streaks', error);
        }
    }
}
