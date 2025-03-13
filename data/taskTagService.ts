import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';

// Define the TaskTag interface
interface TaskTag {
  task_id: UUID;
  tag_id: UUID;
}

// Table name
const TABLE_NAME = 'task_tags';

/**
 * Add a tag to a task
 */
export const addTagToTask = async (taskId: UUID, tagId: UUID): Promise<CrudResponse<TaskTag>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ task_id: taskId, tag_id: tagId }])
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<TaskTag>(error as Error);
  }
};

/**
 * Remove a tag from a task
 */
export const removeTagFromTask = async (taskId: UUID, tagId: UUID): Promise<CrudResponse<null>> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('task_id', taskId)
      .eq('tag_id', tagId);

    return formatResponse(null, error);
  } catch (error) {
    return handleSupabaseError<null>(error as Error);
  }
};

/**
 * Get all tags for a task
 */
export const getTaskTags = async (taskId: UUID): Promise<CrudResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        tag_id,
        tags:tag_id (*)
      `)
      .eq('task_id', taskId);

    // Transform to get just the tags
    const tags = data?.map(item => item.tags) || [];
    
    return formatResponse(tags, error);
  } catch (error) {
    return handleSupabaseError<any[]>(error as Error);
  }
};

/**
 * Remove all tags from a task
 */
export const removeAllTagsFromTask = async (taskId: UUID): Promise<CrudResponse<null>> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('task_id', taskId);

    return formatResponse(null, error);
  } catch (error) {
    return handleSupabaseError<null>(error as Error);
  }
};

/**
 * Set multiple tags for a task (removes existing ones first)
 */
export const setTaskTags = async (taskId: UUID, tagIds: UUID[]): Promise<CrudResponse<any>> => {
  try {
    // Start a transaction
    const { error: removeError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('task_id', taskId);

    if (removeError) {
      return handleSupabaseError<any>(removeError);
    }

    // Create insert data
    const insertData = tagIds.map(tagId => ({
      task_id: taskId,
      tag_id: tagId
    }));

    // Skip insert if no tags to add
    if (insertData.length === 0) {
      return formatResponse([], null);
    }

    // Add new tags
    const { data, error: insertError } = await supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select('*');

    return formatResponse(data, insertError);
  } catch (error) {
    return handleSupabaseError<any>(error as Error);
  }
}; 
