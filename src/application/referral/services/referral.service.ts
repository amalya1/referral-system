import { UserStore } from "@infrastructure/stores/user.store";
import { Injectable } from '@nestjs/common';
import {User} from "@domain/models/user.model";

@Injectable()
export class ReferralService {
    constructor(private readonly userStore: UserStore) {}

    async applyReferral(newUserId: string, referralCode: string): Promise<void> {
        const referrer = await this.userStore.findByReferralCode(referralCode);

        await this.userStore.createReferral(referrer.id, newUserId);

        await this.checkLevelUp(referrer);

        const updatedReferrer = await this.userStore.findById(referrer.id);

        await this.addCredits(updatedReferrer, newUserId);
    }

    private async addCredits(referrer: User, newUserId: string): Promise<void> {
        const currentStreak = referrer.streak ?? 0;

        const creditsToAdd = this.calculateCredits(referrer.level) + currentStreak + 1;

        referrer.credits += creditsToAdd;
        referrer.updateLastInvite();
        await this.userStore.save(referrer);

        const newUser = await this.userStore.findById(newUserId);

        newUser.credits += 100;
        await this.userStore.save(newUser);
    }

    private async checkLevelUp(referrer: User): Promise<void> {
        const invites = await this.userStore.countReferrals(referrer.id);
        if (referrer.level === 1 && invites >= 3) {
            await this.userStore.updateLevel(referrer.id, 2);

        }
    }

    private calculateCredits(level: number): number {
        if (level === 2) return 150;
        return 100;
    }

    async validateReferralCode(referralCode: string): Promise<boolean> {
        const referrer = await this.userStore.findByReferralCode(referralCode);
        return !!referrer;
    }
}
