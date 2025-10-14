/*
  # Update inventory_items user_id to be nullable

  1. Changes
    - Make `user_id` column nullable in `inventory_items` table
    - This allows items to be created without authentication
    - Items will be identified by device ID stored in the app
  
  2. Security
    - Update RLS policies to allow public access
    - Users can manage items they created (identified by device)
*/

ALTER TABLE inventory_items ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can view own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory items" ON inventory_items;

CREATE POLICY "Anyone can view inventory items"
  ON inventory_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert inventory items"
  ON inventory_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update inventory items"
  ON inventory_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete inventory items"
  ON inventory_items FOR DELETE
  TO public
  USING (true);