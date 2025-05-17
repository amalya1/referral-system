import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StartedTestContainer } from 'testcontainers';
import { LoggerService } from '@libs/logger/src/logger.service';

export async function cleanup(app: INestApplication, dataSource: DataSource, container: StartedTestContainer) {
    const logger = app.get(LoggerService);

    logger.info('Cleaning up resources...');

    if (app) {
        await app.close();
        logger.info('App closed');
    }

    if (dataSource?.isInitialized) {
        await dataSource.dropDatabase();
        await dataSource.destroy();
        logger.info('Database dropped and connection destroyed');
    }

    if (container) {
        await container.stop();
        logger.info('Container stopped');
    }
}
