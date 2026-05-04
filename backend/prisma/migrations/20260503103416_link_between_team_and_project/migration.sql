-- AlterTable
ALTER TABLE `teams` ADD COLUMN `project_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
