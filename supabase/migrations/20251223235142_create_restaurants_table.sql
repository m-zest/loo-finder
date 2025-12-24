/*
  # Create restaurants table for Budapest toilet finder

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key) - Unique identifier for each restaurant
      - `name` (text) - Restaurant name
      - `address` (text) - Full address in Budapest
      - `latitude` (decimal) - GPS latitude coordinate
      - `longitude` (decimal) - GPS longitude coordinate
      - `has_toilet` (boolean) - Whether restaurant has public toilet
      - `toilet_code` (text, nullable) - Access code if needed
      - `toilet_notes` (text, nullable) - Additional information about toilet access
      - `opening_hours` (text, nullable) - Restaurant operating hours
      - `phone` (text, nullable) - Contact phone number
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `restaurants` table
    - Add policy for anyone to read restaurant data (public access)
    - Only authenticated users can insert/update restaurants
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  has_toilet boolean DEFAULT true,
  toilet_code text,
  toilet_notes text,
  opening_hours text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
  ON restaurants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete restaurants"
  ON restaurants
  FOR DELETE
  TO authenticated
  USING (true);