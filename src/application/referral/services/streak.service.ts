import {UserStore} from "@infrastructure/stores/user.store";
import {Injectable} from "@nestjs/common";
import { subDays } from 'date-fns';
import {EventBus} from "@nestjs/cqrs";

@Injectable()
export class StreakService {
    constructor(private readonly userStore: UserStore,         private readonly eventBus: EventBus,
    ) {}

    async updateUsersStreak(): Promise<void> {
        const yesterday = subDays(new Date(), 1);
        const { startOfDay, endOfDay } = this.getStartAndEndOfDay(yesterday);

        await this.userStore.bulkUpdateUsersStreak(startOfDay, endOfDay);
    }

    getStartAndEndOfDay(date: Date): { startOfDay: Date; endOfDay: Date } {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        return { startOfDay, endOfDay };
    }
}
