-- Add availability fields to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';

-- Add working days and hours
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '09:00:00';

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '17:00:00';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_employees_availability ON employees USING GIN (availability);
CREATE INDEX IF NOT EXISTS idx_employees_working_days ON employees (working_days); 