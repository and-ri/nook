-- Timezone-aware notifications: per-user timezone, independent reminder toggles
-- (replacing the mutually-exclusive notifyMode), and per-kind reminder dedupe.

-- 1. User: new timezone + reminder toggle columns (with defaults so existing
--    rows are valid), and rename the digest timestamp.
ALTER TABLE "User" ADD COLUMN "timezone" TEXT;
ALTER TABLE "User" ADD COLUMN "remindBefore" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "remindOnDueDate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "weeklySummary" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" RENAME COLUMN "lastDigestSentAt" TO "lastWeeklySummaryAt";

-- 2. Map existing preferences onto the new toggles BEFORE dropping the old enum
--    columns: PER_SUBSCRIPTION -> remind before each payment; DIGEST -> weekly
--    summary. (remindOnDueDate is opt-in, so it stays false.)
UPDATE "User" SET
    "remindBefore"  = ("notifyMode" = 'PER_SUBSCRIPTION'),
    "weeklySummary" = ("notifyMode" = 'DIGEST');

-- 3. Drop the old preference columns and their enum types.
ALTER TABLE "User" DROP COLUMN "notifyMode";
ALTER TABLE "User" DROP COLUMN "notifyDigestFrequency";
DROP TYPE "NotificationMode";
DROP TYPE "DigestFrequency";

-- 4. ReminderLog: add the reminder "kind" and dedupe per kind so a charge can be
--    reminded once as BEFORE and once as DUE. Existing rows are BEFORE reminders.
ALTER TABLE "ReminderLog" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'BEFORE';
DROP INDEX "ReminderLog_userId_subscriptionId_billingDate_key";
CREATE UNIQUE INDEX "ReminderLog_userId_subscriptionId_billingDate_kind_key" ON "ReminderLog"("userId", "subscriptionId", "billingDate", "kind");
