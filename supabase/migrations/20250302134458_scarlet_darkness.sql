/*
  # Add task priority fields

  1. New Fields
    - `deadline` (timestamptz) - When the task is due
    - `value_impact` (integer) - Impact value on a scale of 1-100
    - `difficulty` (integer) - Task difficulty on a scale of 1-10
    - `priority_score` (integer) - Calculated priority score

  2. Changes
    - Add new fields to the tasks table
    - Add constraints to ensure valid ranges for value_impact and difficulty
*/

-- Add deadline field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'deadline'
  ) THEN
    ALTER TABLE tasks ADD COLUMN deadline timestamptz;
  END IF;
END $$;

-- Add value_impact field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'value_impact'
  ) THEN
    ALTER TABLE tasks ADD COLUMN value_impact integer DEFAULT 50
      CHECK (value_impact >= 1 AND value_impact <= 100);
  END IF;
END $$;

-- Add difficulty field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE tasks ADD COLUMN difficulty integer DEFAULT 5
      CHECK (difficulty >= 1 AND difficulty <= 10);
  END IF;
END $$;

-- Add priority_score field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'priority_score'
  ) THEN
    ALTER TABLE tasks ADD COLUMN priority_score integer DEFAULT 50;
  END IF;
END $$;