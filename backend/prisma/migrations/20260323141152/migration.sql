/*
  Warnings:

  - The values [teacher] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `password` VARCHAR(255) NULL,
    MODIFY `role` ENUM('student', 'admin') NOT NULL;
