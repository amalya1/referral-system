 import { User } from '@domain/models/user.model';
 import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {LoggerService} from "@libs/logger/src/logger.service";
import {createTestingApp} from "./setup/app.factory";
import {cleanup} from "./utils/cleanup";
import {INestApplication} from "@nestjs/common";
import {startPostgresContainer} from "./containers/ postgres.container";
 import {StartedPostgreSqlContainer} from "@testcontainers/postgresql";

jest.setTimeout(10000);

describe('AuthController', () => {
    let app: INestApplication ;
    let userRepository: Repository<User>;
    let testContainer: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let logger: LoggerService;

    beforeAll(async () => {
       const  {container, port} = await startPostgresContainer();

        testContainer = container

        const setup = await createTestingApp(port);

        app = setup.app;

        dataSource = setup.dataSource;
        userRepository = setup.moduleFixture.get(getRepositoryToken(User));

        logger = app.get(LoggerService);
    });

    beforeEach(async () => {
        logger.info('Clearing the database before each test...');
        await userRepository.query('DELETE FROM "users";');
    });

    it('should register a new user with valid data', async () => {
        logger.debug('Registering new user with valid data...');
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'validuser@example.com',
                password: 'ValidPassword123',
                firstName: 'Valid',
                lastName: 'User',
            })
            .expect(201);

        expect(response.body).toHaveProperty('accessToken');
        logger.info('User registered successfully');
    });

    it('should return 400 if referral code does not exist', async () => {
        logger.debug('Testing referral code that does not exist...');
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'userwithnonexistentreferral@example.com',
                password: 'ValidPassword123',
                firstName: 'Nonexistent',
                lastName: 'Referrer',
                referralCode: 'NONEXISTENTCODE',
            })
            .expect(400);

        expect(response.body.message).toEqual('Referral code does not exist');
        logger.info('Referral code does not exist error verified');
    });

    it('should return 400 if user already exists', async () => {
        logger.debug('Testing registration with an existing user...');
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'existinguser@example.com',
                password: 'ValidPassword123',
                firstName: 'Test',
                lastName: 'User',
            })
            .expect(201);

        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'existinguser@example.com',
                password: 'ValidPassword123',
                firstName: 'Test',
                lastName: 'User',
            })
            .expect(400);

        expect(response.body.message).toEqual('User with this email already exists');
        logger.info('User already exists error verified');
    });

    it('should save user data in the database and hash the password', async () => {
        logger.debug('Registering user to check password hashing...');
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'newuser@example.com',
                password: 'Password123',
                firstName: 'New',
                lastName: 'User',
            })
            .expect(201);

        const user = await userRepository.findOne({ where: { email: 'newuser@example.com' } });
        expect(user).toBeDefined();
        expect(user.email).toBe('newuser@example.com');
        expect(user.password).not.toBe('Password123');
        logger.info('User registration and password hashing verified');
    });

    afterAll(async () => {
        await cleanup(app, dataSource, testContainer);
    });
});
