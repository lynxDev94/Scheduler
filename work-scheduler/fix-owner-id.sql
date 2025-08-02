-- Fix the owner_id column type to accept Clerk user IDs
-- Run this in your Supabase SQL Editor

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Recreate the organizations table with correct owner_id type
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,  -- TEXT for Clerk user IDs
  business_hours JSONB DEFAULT '{"monday": "9AM-5PM", "tuesday": "9AM-5PM", "wednesday": "9AM-5PM", "thursday": "9AM-5PM", "friday": "9AM-5PM", "saturday": "9AM-5PM", "sunday": "9AM-5PM"}',
  timezone TEXT DEFAULT 'UTC',
  roles JSONB DEFAULT '["Employee", "Manager"]',
  default_shift_length INTEGER DEFAULT 8,
  min_staff_per_shift INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Employee',
  hourly_rate DECIMAL(10,2) DEFAULT 15.00,
  availability JSONB DEFAULT '{"monday": ["9AM", "5PM"], "tuesday": ["9AM", "5PM"], "wednesday": ["9AM", "5PM"], "thursday": ["9AM", "5PM"], "friday": ["9AM", "5PM"]}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE, -- For specific dates (optional)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_schedules_organization_id ON schedules(organization_id);
CREATE INDEX idx_schedules_employee_id ON schedules(employee_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_day_of_week ON schedules(day_of_week);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 