# Node Authentication Service

This project is a Node.js authentication service built using the NestJS framework with TypeScript, following Domain-Driven Design (DDD) and CQRS principles. It includes a referral system integrated into the user registration flow, which rewards users with credits, levels, and streak bonuses for referring others.

## Project Structure

```
.
├── src/
│   ├── application/       # Application layer (use cases, commands, queries)
│   ├── domain/           # Domain layer (business logic, models)
│   ├── infrastructure/   # Infrastructure layer (implementations)
│   └── web-api/         # HTTP interface and controllers
├── libs/                # Shared libraries and utilities
├── scripts/            # Utility scripts
└── logs/              # Application logs
└── docs/              # Project documentation
└── test/              # Integration test
```

## Technology Stack

- Node.js
- NestJS
- TypeScript
- Docker
- PostgreSQL
- JWT for authentication

### Authentication Flow
1. User registration
   - Includes referral code validation and streak-based rewards (if provided)
   - Referrer and referred users receive credits when a valid referral code is used.
2. User login with JWT tokens
3. Profile management
4. Role-based access control

## Architecture

The project follows Clean Architecture principles with distinct layers:

### Domain Layer (`src/domain/`)
- Core business logic and entities
- Business rules and domain models

### Application Layer (`src/application/`)
- Commands: Write operations (registration, login)
- Queries: Read operations
- Events: Domain events and handlers
- Services: Application services

### Infrastructure Layer (`src/infrastructure/`)
- Database repositories
- External service integrations
- Framework implementations

### Web API Layer (`src/web-api/`)
- REST endpoints
- Request/Response handling
- Route configurations

## Design Patterns

1. **CQRS Pattern**
   - Separate command and query operations
   - Event-driven architecture

2. **Repository Pattern**
   - Clean data access abstraction
   - Transaction management

3. **Event-Driven Architecture**
   - Async processing of side effects
   - Separate handlers for different concerns

## Tests

The project includes a variety of tests to ensure the correct behavior of both the user registration flow and the referral system.

- **Unit tests**: Verify individual components such as `ReferralService`.
- **Integration tests**: Verify the full user registration process, including referral code validation and streak rewards.

For detailed test cases, please refer to the [Referral System Tests Documentation](./docs/referral-system.md#tests) for tests specific to the referral system.

## Setup and Configuration

1. Copy `.env.example` to `.env` and configure variables
2. Run with Docker: `docker-compose up`
3. Ensure that the cron jobs are running properly for streak updates. These tasks are triggered automatically at midnight every day.
4. Run unit and integration tests:
   - Use the following command to run the tests: `npm run test` or `yarn test`.
   - Integration tests automatically set up and tear down a PostgreSQL container using `Testcontainers`. The temporary database is created and dropped during the tests.
