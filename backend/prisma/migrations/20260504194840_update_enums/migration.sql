-- AlterTable
ALTER TABLE `exchange_requests` MODIFY `status` ENUM('pending', 'confirmed_initiator', 'confirmed_target', 'pending_teacher', 'approved', 'rejected', 'cancelled') NOT NULL;
