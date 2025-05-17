 import {EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {ReferralService} from "@application/referral/services/referral.service";
import {LoggerService} from "@libs/logger/src/logger.service";
 import {ReferralAppliedEvent} from "@application/referral/events/impl/referral-applied.event";

@EventsHandler(ReferralAppliedEvent)
export class ReferralAppliedHandler implements IEventHandler<ReferralAppliedEvent> {
    constructor(
        private readonly referralService: ReferralService,
        private readonly logger: LoggerService
    ) {}

    async handle(event: ReferralAppliedEvent) {
        try {
            const userId = event.user.id;
            const referralCode = event.referralCode;

            this.logger.debug('Handling ReferralAppliedEvent in ReferralAppliedHandler', {
                userId,
                referralCode,
            });

            if (referralCode) {
                await this.referralService.applyReferral(userId, referralCode);
                this.logger.info(`Referral code applied successfully`, {
                    userId,
                    referralCode,
                });
            } else {
                this.logger.info(`No referral code provided for user`, { userId });
            }
        } catch (error) {
            this.logger.error(`Failed to apply referral code`, error, {
                userId: event.user.id,
                referralCode: event.referralCode,
            });
        }
    }
}
