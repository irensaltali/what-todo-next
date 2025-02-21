/*
  # Add missing columns to tasks table

  1. Changes
    - Add `progress` column for task completion percentage
    - Add `type` column for task categorization
    - Add `task_count` column for subtask counting

  2. Notes
    - Progress is stored as a numeric value between 0 and 100
    - Type is stored as text to allow flexible categorization
    - Task count defaults to 0
*/

DO $$
BEGIN
  -- Add progress column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'progress'
  ) THEN
    ALTER TABLE tasks ADD COLUMN progress numeric DEFAULT 0
      CHECK (progress >= 0 AND progress <= 100);
  END IF;

  -- Add type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'type'
  ) THEN
    ALTER TABLE tasks ADD COLUMN type text DEFAULT 'task';
  END IF;

  -- Add task_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'task_count'
  ) THEN
    ALTER TABLE tasks ADD COLUMN task_count integer DEFAULT 0;
  END IF;
END $$;