-- Account deletion: soft-delete flag + preserve team-owned data when a creator
-- is removed.

-- Soft-delete request timestamp; the scheduler hard-deletes after a grace period.
ALTER TABLE "User" ADD COLUMN "deletionRequestedAt" TIMESTAMP(3);

-- Make "created by" optional and null it out (instead of blocking the delete)
-- when the creating user is removed, so data in shared teams survives.
ALTER TABLE "Subscription" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "PaymentMethod" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentMethod" DROP CONSTRAINT "PaymentMethod_userId_fkey";
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
