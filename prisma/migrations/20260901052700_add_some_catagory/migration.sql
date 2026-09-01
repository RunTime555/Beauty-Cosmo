-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'Hair_oil';
ALTER TYPE "Category" ADD VALUE 'Makeup_Material';
ALTER TYPE "Category" ADD VALUE 'Jewellery';
ALTER TYPE "Category" ADD VALUE 'Women_clothing';
ALTER TYPE "Category" ADD VALUE 'wig';
ALTER TYPE "Category" ADD VALUE 'others';
