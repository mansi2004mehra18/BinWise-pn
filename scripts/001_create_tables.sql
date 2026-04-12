-- BinWise Smart Waste Management - Database Schema

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS collection_routes CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS bins CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS waste_type_enum CASCADE;
DROP TYPE IF EXISTS route_status_enum CASCADE;
