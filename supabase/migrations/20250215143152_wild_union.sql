/*
  # Add updated_at trigger for profiles table

  1. Changes
    - Add trigger function to automatically update the updated_at timestamp
    - Add trigger to profiles table for automatic timestamp updates

  Note: The update policy already exists, so we're only adding the trigger functionality
*/

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();