-- DropForeignKey
ALTER TABLE `courses` DROP FOREIGN KEY `courses_teacher_id_fkey`;

-- DropIndex
DROP INDEX `courses_teacher_id_fkey` ON `courses`;

-- AlterTable
ALTER TABLE `courses` MODIFY `teacher_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
