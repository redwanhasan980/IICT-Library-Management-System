/*
  Warnings:

  - You are about to alter the column `department` on the `book` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.
  - A unique constraint covering the columns `[barcode]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentRegNumber]` on the table `StudentProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId]` on the table `TeacherProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `book` ADD COLUMN `authorEditor` VARCHAR(191) NULL,
    ADD COLUMN `barcode` VARCHAR(191) NULL,
    ADD COLUMN `billDate` DATE NULL,
    ADD COLUMN `billNumber` VARCHAR(191) NULL,
    ADD COLUMN `binding` ENUM('PB', 'HB') NULL,
    ADD COLUMN `callNumber` VARCHAR(191) NULL,
    ADD COLUMN `catalogEntryDate` DATE NULL,
    ADD COLUMN `catalogedById` VARCHAR(191) NULL,
    ADD COLUMN `cutterCode` VARCHAR(191) NULL,
    ADD COLUMN `dateOfPublication` DATE NULL,
    ADD COLUMN `deweyDecimalNumber` DECIMAL(8, 3) NULL,
    ADD COLUMN `edition` VARCHAR(191) NULL,
    ADD COLUMN `locationCode` VARCHAR(191) NULL,
    ADD COLUMN `pagination` INTEGER NULL,
    ADD COLUMN `placeOfPublication` VARCHAR(191) NULL,
    ADD COLUMN `procurementId` VARCHAR(191) NULL,
    ADD COLUMN `publisher` VARCHAR(191) NULL,
    ADD COLUMN `source` ENUM('PURCHASE', 'DONATION', 'GIFT') NULL,
    ADD COLUMN `subjectCategory` VARCHAR(191) NULL,
    ADD COLUMN `volume` VARCHAR(191) NULL,
    MODIFY `department` ENUM('CSE', 'SWE', 'EEE') NULL;

-- AlterTable
ALTER TABLE `loan` ADD COLUMN `borrowerRole` ENUM('ADMIN', 'STUDENT', 'TEACHER') NULL,
    ADD COLUMN `facultySignatureRecordedAt` DATETIME(3) NULL,
    ADD COLUMN `facultySignatureText` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `outsidebookentry` ADD COLUMN `entryStatus` ENUM('ENTERED', 'EXITED') NOT NULL DEFAULT 'ENTERED',
    ADD COLUMN `exitVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `studentDepartmentSnapshot` ENUM('CSE', 'SWE', 'EEE') NULL,
    ADD COLUMN `studentRegNumberSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `studentStrikeMarkedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `studentprofile` ADD COLUMN `currentSemester` INTEGER NULL,
    ADD COLUMN `department` ENUM('CSE', 'SWE', 'EEE') NULL,
    ADD COLUMN `studentRegNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `teacherprofile` ADD COLUMN `department` ENUM('CSE', 'SWE', 'EEE') NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `signatureData` VARCHAR(191) NULL,
    ADD COLUMN `teacherId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ProcurementApplication` (
    `id` VARCHAR(191) NOT NULL,
    `applicationCode` VARCHAR(191) NOT NULL,
    `budgetYear` INTEGER NOT NULL,
    `allocatedBudget` DECIMAL(12, 2) NOT NULL,
    `department` ENUM('CSE', 'SWE', 'EEE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProcurementApplication_applicationCode_key`(`applicationCode`),
    INDEX `ProcurementApplication_budgetYear_department_idx`(`budgetYear`, `department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookRequisition` (
    `id` VARCHAR(191) NOT NULL,
    `requisitionCode` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `bookTitle` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `publisher` VARCHAR(191) NULL,
    `edition` VARCHAR(191) NULL,
    `isbn` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `pricePerUnit` DECIMAL(12, 2) NULL,
    `totalPrice` DECIMAL(12, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BookRequisition_requisitionCode_key`(`requisitionCode`),
    INDEX `BookRequisition_applicationId_idx`(`applicationId`),
    INDEX `BookRequisition_isbn_idx`(`isbn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vendor` (
    `id` VARCHAR(191) NOT NULL,
    `vendorCode` VARCHAR(191) NOT NULL,
    `vendorName` VARCHAR(191) NOT NULL,
    `quotationDetails` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vendor_vendorCode_key`(`vendorCode`),
    INDEX `Vendor_vendorName_idx`(`vendorName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Procurement` (
    `id` VARCHAR(191) NOT NULL,
    `procurementCode` VARCHAR(191) NOT NULL,
    `requisitionId` VARCHAR(191) NOT NULL,
    `vendorId` VARCHAR(191) NOT NULL,
    `procurementApprovalDate` DATE NULL,
    `deliveryDate` DATE NULL,
    `handoverDateToIICT` DATE NULL,
    `bookReceivingRecord` VARCHAR(191) NULL,
    `shelvingStatus` ENUM('PENDING', 'IN_PROGRESS', 'SHELVED') NOT NULL DEFAULT 'PENDING',
    `procurementStatus` ENUM('NOT_STARTED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NOT_STARTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Procurement_procurementCode_key`(`procurementCode`),
    INDEX `Procurement_requisitionId_idx`(`requisitionId`),
    INDEX `Procurement_vendorId_idx`(`vendorId`),
    INDEX `Procurement_procurementStatus_shelvingStatus_idx`(`procurementStatus`, `shelvingStatus`),
    INDEX `Procurement_handoverDateToIICT_idx`(`handoverDateToIICT`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Book_barcode_key` ON `Book`(`barcode`);

-- CreateIndex
CREATE INDEX `Book_department_idx` ON `Book`(`department`);

-- CreateIndex
CREATE INDEX `Book_deweyDecimalNumber_idx` ON `Book`(`deweyDecimalNumber`);

-- CreateIndex
CREATE INDEX `Book_callNumber_idx` ON `Book`(`callNumber`);

-- CreateIndex
CREATE INDEX `Book_barcode_idx` ON `Book`(`barcode`);

-- CreateIndex
CREATE INDEX `Book_procurementId_idx` ON `Book`(`procurementId`);

-- CreateIndex
CREATE INDEX `Loan_borrowerRole_status_idx` ON `Loan`(`borrowerRole`, `status`);

-- CreateIndex
CREATE INDEX `OutsideBookEntry_entryStatus_entryTime_idx` ON `OutsideBookEntry`(`entryStatus`, `entryTime`);

-- CreateIndex
CREATE INDEX `OutsideBookEntry_studentDepartmentSnapshot_entryStatus_idx` ON `OutsideBookEntry`(`studentDepartmentSnapshot`, `entryStatus`);

-- CreateIndex
CREATE UNIQUE INDEX `StudentProfile_studentRegNumber_key` ON `StudentProfile`(`studentRegNumber`);

-- CreateIndex
CREATE INDEX `StudentProfile_department_idx` ON `StudentProfile`(`department`);

-- CreateIndex
CREATE UNIQUE INDEX `TeacherProfile_teacherId_key` ON `TeacherProfile`(`teacherId`);

-- CreateIndex
CREATE INDEX `TeacherProfile_department_idx` ON `TeacherProfile`(`department`);

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_catalogedById_fkey` FOREIGN KEY (`catalogedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_procurementId_fkey` FOREIGN KEY (`procurementId`) REFERENCES `Procurement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookRequisition` ADD CONSTRAINT `BookRequisition_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `ProcurementApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Procurement` ADD CONSTRAINT `Procurement_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `BookRequisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Procurement` ADD CONSTRAINT `Procurement_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
