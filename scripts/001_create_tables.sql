-- EcoTrack Smart Waste Management - Database Schema
-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS collection_routes CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS bins CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS waste_type_enum CASCADE;
DROP TYPE IF EXISTS route_status_enum CASCADE;

-- Create enums
CREATE TYPE waste_type_enum AS ENUM ('organic', 'recyclable', 'hazardous', 'general');
CREATE TYPE route_status_enum AS ENUM ('pending', 'in_progress', 'completed');

-- Citizens table
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  qr_code TEXT NOT NULL UNIQUE,
  reward_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bins table
CREATE TABLE bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  fill_level INTEGER NOT NULL DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
  waste_type waste_type_enum NOT NULL DEFAULT 'general',
  area TEXT NOT NULL,
  capacity_liters INTEGER NOT NULL DEFAULT 240,
  last_emptied TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deposits table
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
  waste_type waste_type_enum NOT NULL,
  weight_kg FLOAT NOT NULL CHECK (weight_kg > 0),
  correctly_segregated BOOLEAN NOT NULL DEFAULT true,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collection Routes table
CREATE TABLE collection_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bin_ids UUID[] NOT NULL DEFAULT '{}',
  total_distance_km FLOAT NOT NULL DEFAULT 0,
  estimated_time_min INTEGER NOT NULL DEFAULT 0,
  carbon_saved_kg FLOAT NOT NULL DEFAULT 0,
  status route_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_deposits_citizen_id ON deposits(citizen_id);
CREATE INDEX idx_deposits_bin_id ON deposits(bin_id);
CREATE INDEX idx_deposits_created_at ON deposits(created_at DESC);
CREATE INDEX idx_bins_fill_level ON bins(fill_level);
CREATE INDEX idx_bins_area ON bins(area);

-- Disable RLS since we use simulated auth
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_routes ENABLE ROW LEVEL SECURITY;

-- Allow all access (no real auth, just API routes as the access layer)
CREATE POLICY "Allow all access to citizens" ON citizens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bins" ON bins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to deposits" ON deposits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to collection_routes" ON collection_routes FOR ALL USING (true) WITH CHECK (true);
