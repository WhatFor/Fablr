-- AlterTable
ALTER TABLE `Node` MODIFY `type` ENUM('Start', 'Standard', 'Lose', 'Win') NOT NULL;
