import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from '@domain/models/user.model';

@Injectable()
export class UserStore {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findByReferralCode(referralCode: string): Promise<User | null> {
    return this.repository.findOne({ where: { referralCode } });
  }

  async createReferral(referrerId: string, referredId: string): Promise<void> {
    await this.repository.update(referredId, { referrerId });
  }

  async updateLevel(referrerId: string, level: number): Promise<void> {
    await this.repository.update(referrerId, { level });
  }

  async countReferrals(referrerId: string): Promise<number> {
    return await this.repository.count({
      where: {referrerId},
    });
  }

  async bulkUpdateUsersStreak(yesterdayStart: Date, yesterdayEnd: Date): Promise<void> {
    await this.repository
        .createQueryBuilder()
        .update(User)
        .set({
          streak: () => `
            CASE
              WHEN "lastInviteAt" BETWEEN '${yesterdayStart.toISOString()}' AND '${yesterdayEnd.toISOString()}' THEN "streak" + 1
              WHEN "lastInviteAt" < '${yesterdayStart.toISOString()}' AND "streak" != 0 THEN 0
              ELSE "streak"
            END
          `,
        })
        .where('lastInviteAt IS NOT NULL')
        .execute();
  }
}
