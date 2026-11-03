/*
  Warnings:

  - You are about to drop the column `role` on the `ChatMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMember" DROP COLUMN "role",
ADD COLUMN     "chatRole" "ChatRole" NOT NULL DEFAULT 'MEMBER';
