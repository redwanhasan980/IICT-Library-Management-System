CREATE TABLE `BookImage` (
    `id` VARCHAR(191) NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `cloudinaryPublicId` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NULL,
    `secureUrl` VARCHAR(1024) NOT NULL,
    `format` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `bytes` INTEGER NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BookImage_cloudinaryPublicId_key`(`cloudinaryPublicId`),
    INDEX `BookImage_bookId_sortOrder_idx`(`bookId`, `sortOrder`),
    INDEX `BookImage_bookId_isPrimary_idx`(`bookId`, `isPrimary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BookImage` ADD CONSTRAINT `BookImage_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
