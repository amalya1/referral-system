import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@web-api/modules/auth/auth.module';
import { User } from '@domain/models/user.model';
import { DataSource } from 'typeorm';
import {AppWithDeps} from "../types";

export async function createTestingApp(port: number): Promise<AppWithDeps> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port,
                username: 'postgres',
                password: 'postgres',
                database: 'postgres',
                entities: [User],
                synchronize: true,
                migrations: [
                    'dist/infrastructure/database/migrations/1681317600000-CreateUsersTable.js',
                    'dist/infrastructure/database/migrations/1745945931899-AddReferralFieldsToUsers.js',
                ],
                migrationsRun: true,
                logging: true,
            }),
            TypeOrmModule.forFeature([User]),
            AuthModule,
            await ConfigModule.forRoot({isGlobal: true}),
        ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);

    return { app, dataSource, moduleFixture };
}
