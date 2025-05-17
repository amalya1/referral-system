import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

export interface TestContainerData {
    container: StartedPostgreSqlContainer;
    port: number;
}

export interface AppWithDeps {
    app: INestApplication;
    dataSource: DataSource;
    moduleFixture: TestingModule;
}