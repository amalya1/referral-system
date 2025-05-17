import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferralFieldsToUsers1745945931899 implements MigrationInterface {
    name = 'AddReferralFieldsToUsers1745945931899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "referralCode" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "referrerId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "level" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "users" ADD "streak" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD "credits" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastInviteAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_referrerId_users_id"
            FOREIGN KEY ("referrerId") REFERENCES "users"("id")
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_referrerId_users_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastInviteAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "credits"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "streak"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "level"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "referrerId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "referralCode"`);
    }

}
