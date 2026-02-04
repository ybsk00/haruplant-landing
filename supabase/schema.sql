-- =============================================
-- 하루인플란트치과 Supabase Schema
-- 30-day TTL based data management
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Visitors Table (방문자)
-- =============================================
CREATE TABLE IF NOT EXISTS visitors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

-- Index for TTL cleanup
CREATE INDEX IF NOT EXISTS idx_visitors_expires_at ON visitors(expires_at);

-- =============================================
-- 2. Leads Table (회원정보/리드)
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id uuid UNIQUE NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    privacy_agreed boolean NOT NULL DEFAULT false,
    privacy_version text NOT NULL DEFAULT '2026-02-04-v1',
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
    
    CONSTRAINT fk_leads_visitor
        FOREIGN KEY (visitor_id) 
        REFERENCES visitors(id) 
        ON DELETE CASCADE
);

-- Index for TTL cleanup
CREATE INDEX IF NOT EXISTS idx_leads_expires_at ON leads(expires_at);
CREATE INDEX IF NOT EXISTS idx_leads_visitor_id ON leads(visitor_id);

-- =============================================
-- 3. Bookings Table (예약)
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id uuid NOT NULL,
    service text DEFAULT 'implant',
    status text DEFAULT 'requested',
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
    
    CONSTRAINT fk_bookings_visitor
        FOREIGN KEY (visitor_id) 
        REFERENCES visitors(id) 
        ON DELETE CASCADE
);

-- Index for TTL cleanup
CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON bookings(expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_visitor_id ON bookings(visitor_id);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Visitors: Allow all operations for anonymous users
CREATE POLICY "Allow all operations on visitors" ON visitors
    FOR ALL USING (true) WITH CHECK (true);

-- Leads: Allow all operations for anonymous users
CREATE POLICY "Allow all operations on leads" ON leads
    FOR ALL USING (true) WITH CHECK (true);

-- Bookings: Allow all operations for anonymous users
CREATE POLICY "Allow all operations on bookings" ON bookings
    FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Daily Cleanup Function
-- Run this via pg_cron or Supabase Scheduled Function
-- =============================================
-- DELETE FROM bookings WHERE expires_at < now();
-- DELETE FROM leads WHERE expires_at < now();
-- DELETE FROM visitors WHERE expires_at < now();
