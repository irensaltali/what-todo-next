/*
  # Add tags column to tasks table

  1. Changes
    - Add `tags` text[] column to tasks table with default empty array
    
  2. Notes
    - Uses safe migration pattern with IF NOT EXISTS check
    - Uses array type for better tag management and querying
    - Sets default value to empty array to ensure data consistency
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'tags'
  ) THEN
    ALTER TABLE tasks ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;