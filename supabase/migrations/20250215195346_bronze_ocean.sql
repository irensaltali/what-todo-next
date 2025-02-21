/*
  # Update profiles table structure

  1. Changes
    - Drop existing profiles table
    - Recreate profiles table with user_id column instead of uuid
    - Recreate RLS policies
    - Recreate foreign key constraints in tasks table

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

-- First, drop the foreign key constraint from tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- Drop the existing profiles table
DROP TABLE IF EXISTS profiles;

-- Create the new profiles table
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update tasks foreign key to reference the new profiles table
ALTER TABLE tasks
  ADD CONSTRAINT tasks_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(user_id)
  ON DELETE CASCADE;