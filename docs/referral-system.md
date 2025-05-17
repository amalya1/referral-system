# 📌 Referral System Documentation

This document describes the implementation details of the referral system.

## Overview

The referral system enhances the existing user registration process by rewarding users for inviting others. It includes credits, level progression, and streak bonuses.

## Features Implemented

### 1. Referral Code Field

* A new field `referral_code` was added to the `users` table.
* Each user receives a unique lowercase alphanumeric referral code (9 characters).
* This code can be shared by existing users to refer new users to the platform.

### 2. Database Migration

* The migration adds not only the referral_code field but also introduces other necessary fields to support the referral functionality:

* referrer_id: Links a user to their referrer (if applicable).

* level: Tracks the user's progression in the referral system (default is Level 1).

* streak: Tracks the number of consecutive days the user has invited someone (initially set to 0).

* credits: Stores the total number of credits a user has earned.

* last_invite_at: Keeps track of the last time a user made a referral.

* The migration ensures that these additions do not interfere with existing logic. By adding the referrer_id as a nullable foreign key, we maintain flexibility in the system while allowing users to refer others without breaking any existing workflows.

* Foreign key constraints were also added, ensuring referential integrity and maintaining clean relationships between users and their referrers. If a user is deleted, the referrer_id is set to NULL, avoiding orphaned records.

### 3. Registration Flow with Referral

* When a user registers, they can input a `referralCode`.
* If valid, both the new user and the referrer receive 100 credits.
* The referral is validated via the `ReferralService.validateReferralCode` method.

### 4. Credit Bonuses and Levels

* **Level 1** (default): User gets 100 credits per referral.
* **Level 2** (starting from the 3rd successful referral): the user receives 150 credits per referral.
* Level is automatically updated after each successful referral.

### 5. Streak System

* **Streak**: Number of consecutive days the user made at least one referral.
* If a day is missed, the streak resets to 0.
* **Credit bonus = base credit + current streak value**
* A scheduled task runs daily at midnight and publishes the `DailyStreakUpdateTriggeredEvent`. This event triggers the `StreakService`, which evaluates each user’s `lastInviteAt` timestamp.
  * If the user invited someone yesterday, their streak is incremented by 1.
  * If they didn’t and their streak is non-zero, it is reset to 0.
  * Otherwise, the streak remains unchanged.
* This logic is executed efficiently through a single SQL UPDATE using a conditional CASE expression.

## Event-Driven Implementation

* After a user is successfully saved, the system checks if a referral code was provided.

* If a referral code is present and valid, a `ReferralAppliedEvent` is published.

* A corresponding handler applies referral bonuses, updates levels and credits.

* Streaks are updated via a scheduled job.

## API Documentation

* `POST /auth/register` accepts optional `referralCode` in the body.
* Swagger documentation (`@nestjs/swagger`) is updated:

    * Descriptions added to `RegisterDto`
    * `@ApiResponse` extended to describe referral bonus scenario

## Tests

* Unit tests for `ReferralService` verify:
  * Referral application flow
  * Bonus credits calculation based on level and streak
  * Conditional level-up logic (based on referral count)
  * Credit assignment to referrer and referred user

* Integration tests verify:
  * Full user registration flow with referral code
  * Validation of non-existent referral codes
  * Prevention of duplicate registrations
  * Correct password hashing and user persistence

* A PostgreSQL container is started dynamically using `Testcontainers` during integration tests.
  * A temporary database is created and dropped after tests complete
  * `TypeORM` migrations are executed automatically inside the container

## Notes

* Streaks and level updates are triggered through event handlers and background jobs.
* The system is modular and follows CQRS + DDD best practices.