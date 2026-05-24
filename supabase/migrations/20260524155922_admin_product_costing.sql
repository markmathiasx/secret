DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProfitMode') THEN
    CREATE TYPE "ProfitMode" AS ENUM ('margin', 'markup');
  END IF;
END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "estimatedGrams" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "estimatedHours" DECIMAL(8, 2),
  ADD COLUMN IF NOT EXISTS "spoolPricePerKg" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "machineHourlyRate" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "postProcessMinutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "laborHourlyRate" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "packagingCost" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "overheadPercent" DECIMAL(6, 2),
  ADD COLUMN IF NOT EXISTS "profitMode" "ProfitMode",
  ADD COLUMN IF NOT EXISTS "profitTargetPercent" DECIMAL(6, 2),
  ADD COLUMN IF NOT EXISTS "estimatedProfitAmount" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "estimatedProfitPercent" DECIMAL(6, 2),
  ADD COLUMN IF NOT EXISTS "costingUpdatedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Product_costingUpdatedAt_idx" ON "Product"("costingUpdatedAt");
