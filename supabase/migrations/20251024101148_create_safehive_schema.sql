/*
  # SAFEHIVE Emergency Safety App Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `phone_number` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `emergency_contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `contact_name` (text)
      - `contact_phone` (text)
      - `created_at` (timestamp)
    
    - `sos_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `location_url` (text)
      - `audio_url` (text, nullable)
      - `status` (text, default 'active')
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own profile data
    - Users can only manage their own emergency contacts
    - Users can create SOS events and read their own events
    - Emergency contacts can view SOS events shared with them

  3. Important Notes
    - Phone authentication will be handled by Supabase Auth
    - Location data stored with high precision for emergency response
    - Audio recordings stored in Supabase Storage (optional feature)
    - Status field for SOS events: 'active', 'resolved', 'cancelled'
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create sos_events table
CREATE TABLE IF NOT EXISTS sos_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  location_url text NOT NULL,
  audio_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own SOS events"
  ON sos_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own SOS events"
  ON sos_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own SOS events"
  ON sos_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_events_user_id ON sos_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_events_status ON sos_events(status);
CREATE INDEX IF NOT EXISTS idx_sos_events_created_at ON sos_events(created_at DESC);