import {IEvent} from '@nestjs/cqrs';

export class DailyStreakUpdateTriggeredEvent implements IEvent {
    readonly type = 'DailyStreakUpdateTriggeredEvent';
    readonly timestamp: Date

    constructor() {
        this.timestamp = new Date();
    }
}
