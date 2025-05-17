import { IEvent } from '@nestjs/cqrs';
import { User } from '@domain/models/user.model';

export class ReferralAppliedEvent  implements IEvent {
    readonly type = 'ReferralAppliedEvent ';
    readonly timestamp: Date;

    constructor(
        public readonly user: User,
        public readonly referralCode?: string
    ) {
        this.timestamp = new Date();
    }
}
