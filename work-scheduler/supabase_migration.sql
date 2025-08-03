-- Migration to update schedules table for the scheduler app
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'schedules';

-- Make day_of_week nullable since we're using the date column instead
ALTER TABLE schedules 
ALTER COLUMN day_of_week DROP NOT NULL;

-- Add missing columns to the schedules table
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'shift' CHECK (type IN ('shift', 'holiday', 'day-off')),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Employee';

-- Update existing records to have default values
UPDATE schedules 
SET hourly_rate = 0.00 
WHERE hourly_rate IS NULL;

UPDATE schedules 
SET type = 'shift' 
WHERE type IS NULL;

UPDATE schedules 
SET role = 'Employee' 
WHERE role IS NULL;

-- Make sure the columns are not nullable for new records
ALTER TABLE schedules 
ALTER COLUMN hourly_rate SET NOT NULL,
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN role SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_organization_date ON schedules(organization_id, date);
CREATE INDEX IF NOT EXISTS idx_schedules_employee_date ON schedules(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_schedules_type ON schedules(type);

-- Verify the table structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'schedules' 
-- ORDER BY ordinal_position; 