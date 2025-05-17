import {PostgreSqlContainer} from "@testcontainers/postgresql";
import {TestContainerData} from "../types";

export async function startPostgresContainer(): Promise<TestContainerData> {
    const pgContainer = await new PostgreSqlContainer('postgres:14-alpine')
        .withUsername("postgres")
        .withPassword("postgres")
        .withDatabase("postgres")
        .withExposedPorts(5432)
        .start()

    const port = pgContainer.getMappedPort(5432);

    return {
        container: pgContainer,
        port
    }
}
