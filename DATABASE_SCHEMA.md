# Database Schema Notes (MariaDB + Prisma)

## Datasource

Prisma datasource is configured as:

- provider: mysql
- DATABASE_URL: MariaDB-compatible connection string

## Core Models

### User

- id (cuid, PK)
- email (unique)
- password
- name
- role (ADMIN | STUDENT | TEACHER)
- createdAt / updatedAt

### StudentProfile

- id (PK)
- userId (unique, FK -> User)
- entries relation to OutsideBookEntry

### AdminProfile

- id (PK)
- userId (unique, FK -> User)
- verifiedEntries relation
- verifiedExits relation

### TeacherProfile

- id (PK)
- userId (unique, FK -> User)

### OutsideBookEntry

- id (PK)
- studentId (FK -> StudentProfile)
- title
- author
- entryTime
- exitTime nullable
- isVerifiedEntry
- isVerifiedExit
- verifiedByEntryId nullable (FK -> AdminProfile)
- verifiedByExitId nullable (FK -> AdminProfile)
- createdAt / updatedAt

Indexes:

- studentId
- (isVerifiedExit, entryTime)
- (isVerifiedEntry, isVerifiedExit)

## Migration Flow

Recommended workflow:

1. Update schema.prisma
2. Run prisma generate
3. Run prisma migrate dev (development) or prisma migrate deploy (deployment)

## Seed Flow

- No seed script is currently registered.
- Optional next step: add Prisma seed to generate users/profiles/outside-book demo records.

## Compatibility Notes

- Schema and connection URL are kept MariaDB-compatible.
- Use mysql:// in DATABASE_URL for MariaDB with Prisma.
