CREATE TABLE IF NOT EXISTS `AuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `actorId` VARCHAR(191) NULL,
  `actorRole` ENUM('ADMIN', 'STUDENT', 'TEACHER') NULL,
  `action` VARCHAR(191) NOT NULL,
  `entityType` VARCHAR(191) NULL,
  `entityId` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` VARCHAR(512) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `AuditLog_action_createdAt_idx`(`action`, `createdAt`),
  INDEX `AuditLog_actorId_createdAt_idx`(`actorId`, `createdAt`),
  INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
  INDEX `AuditLog_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Book` ADD COLUMN `coverImageUrl` VARCHAR(512) NULL;
