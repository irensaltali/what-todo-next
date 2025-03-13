import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';

// Define the Tag interface
interface Tag {
  id: UUID;
  user_id: UUID;
  name: string;
  color?: string | null;
  created_at: string;
}

// Define types for Tag creation and update
export type CreateTagInput = Omit<Tag, 'id' | 'created_at'>;
export type UpdateTagInput = Partial<Omit<Tag, 'id' | 'created_at'>>;

// Table name
const TABLE_NAME = 'tags';

/**
 * Create a new tag
 */
export const createTag = async (tagData: CreateTagInput): Promise<CrudResponse<Tag>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([tagData])
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<Tag>(error as Error);
  }
};

/**
 * Get a tag by ID
 */
export const getTagById = async (id: UUID): Promise<CrudResponse<Tag>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<Tag>(error as Error);
  }
};

/**
 * Get all tags for a user
 */
export const getUserTags = async (userId: UUID): Promise<CrudResponse<Tag[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    return formatResponse(data || [], error);
  } catch (error) {
    return handleSupabaseError<Tag[]>(error as Error);
  }
};

/**
 * Update a tag
 */
export const updateTag = async (id: UUID, tagData: UpdateTagInput): Promise<CrudResponse<Tag>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(tagData)
      .eq('id', id)
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<Tag>(error as Error);
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (id: UUID): Promise<CrudResponse<null>> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    return formatResponse(null, error);
  } catch (error) {
    return handleSupabaseError<null>(error as Error);
  }
};

/**
 * Get tasks for a tag using the task_tags junction table
 */
export const getTagTasks = async (tagId: UUID): Promise<CrudResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from('task_tags') // Junction table
      .select(`
        task_id,
        tasks:task_id (*)
      `)
      .eq('tag_id', tagId);

    // Transform to get just the tasks
    const tasks = data?.map(item => item.tasks) || [];
    
    return formatResponse(tasks, error);
  } catch (error) {
    return handleSupabaseError<any[]>(error as Error);
  }
}; 
