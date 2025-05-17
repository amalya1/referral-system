import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from './referral.service';
import { UserStore } from '@infrastructure/stores/user.store';
import { User } from '@domain/models/user.model';

describe('ReferralService', () => {
    let service: ReferralService;
    let userStore: jest.Mocked<UserStore>;

    const mockReferrer: User = {
        id: 'referrer-id',
        level: 1,
        credits: 0,
        streak: 1,
    } as any;

    const mockUpdatedReferrer: User = {
        id: 'referrer-id',
        level: 1,
        credits: 0,
        streak: 1,
        updateLastInvite: jest.fn(),
    } as any;

    const mockNewUser: User = {
        id: 'new-user-id',
        credits: 0,
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferralService,
                {
                    provide: UserStore,
                    useValue: {
                        findByReferralCode: jest.fn().mockResolvedValue(mockReferrer),
                        createReferral: jest.fn(),
                        save: jest.fn(),
                        findById: jest.fn((id: string) => {
                            if (id === 'referrer-id') return Promise.resolve(mockUpdatedReferrer);
                            if (id === 'new-user-id') return Promise.resolve(mockNewUser);
                            return Promise.resolve(undefined);
                        }),
                        countReferrals: jest.fn().mockResolvedValue(3),
                        updateLevel: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ReferralService>(ReferralService);
        userStore = module.get(UserStore);
    });

    it('should apply referral, add credits and level up if conditions met', async () => {
        await service.applyReferral('new-user-id', 'ref-code');

        expect(userStore.findByReferralCode).toHaveBeenCalledWith('ref-code');
        expect(userStore.createReferral).toHaveBeenCalledWith('referrer-id', 'new-user-id');
        expect(userStore.countReferrals).toHaveBeenCalledWith('referrer-id');
        expect(userStore.updateLevel).toHaveBeenCalledWith('referrer-id', 2);

        expect(mockUpdatedReferrer.credits).toBe(100 + mockUpdatedReferrer.streak + 1);
        expect(mockUpdatedReferrer.updateLastInvite).toHaveBeenCalled();
        expect(userStore.save).toHaveBeenCalledWith(mockUpdatedReferrer);

        expect(mockNewUser.credits).toBe(100);
        expect(userStore.save).toHaveBeenCalledWith(mockNewUser);
    });

    it('should not level up if invite count is less than 3', async () => {
        userStore.countReferrals.mockResolvedValueOnce(2);

        await service.applyReferral('new-user-id', 'ref-code');

        expect(userStore.updateLevel).not.toHaveBeenCalled();
    });

    it('should calculate credits based on level 2 correctly', async () => {
        mockReferrer.level = 2;
        mockUpdatedReferrer.level = 2;
        mockUpdatedReferrer.credits = 0;
        mockUpdatedReferrer.streak = 0;

        await service.applyReferral('new-user-id', 'ref-code');

        expect(mockUpdatedReferrer.credits).toBe(151);
    });

    it('should add streak value to credits', async () => {
        mockReferrer.level = 1;
        mockUpdatedReferrer.level = 1;
        mockUpdatedReferrer.credits = 0;
        mockUpdatedReferrer.streak = 2;

        await service.applyReferral('new-user-id', 'ref-code');

        expect(mockUpdatedReferrer.credits).toBe(103);
    });

});
