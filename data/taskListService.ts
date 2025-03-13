import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';

// Define the TaskList interface
interface TaskList {
  task_id: UUID;
  list_id: UUID;
}

// Table name
const TABLE_NAME = 'task_lists';

/**
 * Add a task to a list
 */
export const addTaskToList = async (taskId: UUID, listId: UUID): Promise<CrudResponse<TaskList>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ task_id: taskId, list_id: listId }])
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<TaskList>(error as Error);
  }
};

/**
 * Remove a task from a list
 */
export const removeTaskFromList = async (taskId: UUID, listId: UUID): Promise<CrudResponse<null>> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('task_id', taskId)
      .eq('list_id', listId);

    return formatResponse(null, error);
  } catch (error) {
    return handleSupabaseError<null>(error as Error);
  }
};

/**
 * Get all lists for a task
 */
export const getTaskLists = async (taskId: UUID): Promise<CrudResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        list_id,
        lists:list_id (*)
      `)
      .eq('task_id', taskId);

    // Transform to get just the lists
    const lists = data?.map(item => item.lists) || [];
    
    return formatResponse(lists, error);
  } catch (error) {
    return handleSupabaseError<any[]>(error as Error);
  }
};

/**
 * Remove a task from all lists
 */
export const removeTaskFromAllLists = async (taskId: UUID): Promise<CrudResponse<null>> => {
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
 * Set multiple lists for a task (removes existing ones first)
 */
export const setTaskLists = async (taskId: UUID, listIds: UUID[]): Promise<CrudResponse<any>> => {
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
    const insertData = listIds.map(listId => ({
      task_id: taskId,
      list_id: listId
    }));

    // Skip insert if no lists to add
    if (insertData.length === 0) {
      return formatResponse([], null);
    }

    // Add new lists
    const { data, error: insertError } = await supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select('*');

    return formatResponse(data, insertError);
  } catch (error) {
    return handleSupabaseError<any>(error as Error);
  }
}; 
