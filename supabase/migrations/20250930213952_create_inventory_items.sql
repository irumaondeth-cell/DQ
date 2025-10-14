/*
  # Create Inventory Items Table

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key) - Unique identifier for each item
      - `qr_code` (text, unique, not null) - QR code identifier for the item
      - `name` (text, not null) - Name/title of the inventory item
      - `description` (text) - Detailed description of the item
      - `photo_url` (text) - URL to the item's photo
      - `quantity` (integer, default 1) - Quantity of items
      - `category` (text) - Category classification
      - `location` (text) - Physical location of the item
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `user_id` (uuid, not null) - Reference to the user who created the item
  
  2. Security
    - Enable RLS on `inventory_items` table
    - Add policy for authenticated users to read their own items
    - Add policy for authenticated users to insert their own items
    - Add policy for authenticated users to update their own items
    - Add policy for authenticated users to delete their own items

  3. Important Notes
    - QR codes must be unique across the system
    - Each user can only access their own inventory items
    - Photos will be stored separately and referenced by URL
*/

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  photo_url text,
  quantity integer DEFAULT 1,
  category text DEFAULT '',
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory items"
  ON inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_qr_code ON inventory_items(qr_code);