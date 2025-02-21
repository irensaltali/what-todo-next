/*
  # Add alert_enabled column to tasks table

  1. Changes
    - Add `alert_enabled` boolean column to tasks table with default value false
    
  2. Notes
    - Uses safe migration pattern with IF NOT EXISTS check
    - Sets default value to ensure data consistency
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'alert_enabled'
  ) THEN
    ALTER TABLE tasks ADD COLUMN alert_enabled boolean DEFAULT false;
  END IF;
END $$;