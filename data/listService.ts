import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';

// Define the List interface
interface List {
  id: UUID;
  user_id: UUID;
  name: string;
  created_at: string;
}

// Define types for List creation and update
export type CreateListInput = Omit<List, 'id' | 'created_at'>;
export type UpdateListInput = Partial<Omit<List, 'id' | 'created_at'>>;

// Table name
const TABLE_NAME = 'lists';

/**
 * Create a new list
 */
export const createList = async (listData: CreateListInput): Promise<CrudResponse<List>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([listData])
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<List>(error as Error);
  }
};

/**
 * Get a list by ID
 */
export const getListById = async (id: UUID): Promise<CrudResponse<List>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<List>(error as Error);
  }
};

/**
 * Get all lists for a user
 */
export const getUserLists = async (userId: UUID): Promise<CrudResponse<List[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    return formatResponse(data || [], error);
  } catch (error) {
    return handleSupabaseError<List[]>(error as Error);
  }
};

/**
 * Update a list
 */
export const updateList = async (id: UUID, listData: UpdateListInput): Promise<CrudResponse<List>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(listData)
      .eq('id', id)
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<List>(error as Error);
  }
};

/**
 * Delete a list
 */
export const deleteList = async (id: UUID): Promise<CrudResponse<null>> => {
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
 * Get tasks for a list using the task_lists junction table
 */
export const getListTasks = async (listId: UUID): Promise<CrudResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from('task_lists') // Junction table
      .select(`
        task_id,
        tasks:task_id (*)
      `)
      .eq('list_id', listId);

    // Transform to get just the tasks
    const tasks = data?.map(item => item.tasks) || [];
    
    return formatResponse(tasks, error);
  } catch (error) {
    return handleSupabaseError<any[]>(error as Error);
  }
}; 
