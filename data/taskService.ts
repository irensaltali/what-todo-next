import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';

// Define the Task interface and export it
export interface Task {
  id: UUID;
  user_id: UUID;
  parent_task_id: UUID | null;
  title: string;
  description?: string | null;
  deadline?: string | null;
  priority?: number | null;
  outcome_value?: string | null;
  difficulty?: number | null;
  is_recursive: boolean;
  recursion_count?: number | null;
  recursion_end?: string | null;
  is_deleted: boolean;
  status: 'ongoing' | 'inprogress' | 'canceled' | 'completed';
  created_at: string;
  updated_at: string;
}

// Define types for Task creation and update
export type CreateTaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;

// Table name
const TABLE_NAME = 'tasks';

/**
 * Create a new task
 */
export const createTask = async (taskData: CreateTaskInput): Promise<CrudResponse<Task>> => {
  try {
    // Set default status to 'ongoing' if not provided
    const dataToInsert = {
      ...taskData,
      status: taskData.status || 'ongoing'
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([dataToInsert])
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<Task>(error as Error);
  }
};

/**
 * Get a task by ID
 */
export const getTaskById = async (id: UUID): Promise<CrudResponse<Task>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<Task>(error as Error);
  }
};

/**
 * Get all tasks for a user
 */
export const getUserTasks = async (userId: UUID): Promise<CrudResponse<Task[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    return formatResponse(data || [], error);
  } catch (error) {
    return handleSupabaseError<Task[]>(error as Error);
  }
};

/**
 * Update a task
 */
export const updateTask = async (id: UUID, taskData: UpdateTaskInput): Promise<CrudResponse<Task>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(taskData)
      .eq('id', id)
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<Task>(error as Error);
  }
};

/**
 * Delete a task (soft delete)
 */
export const softDeleteTask = async (id: UUID): Promise<CrudResponse<Task>> => {
  return updateTask(id, { is_deleted: true });
};

/**
 * Permanently delete a task
 */
export const hardDeleteTask = async (id: UUID): Promise<CrudResponse<null>> => {
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
 * Get tasks by parent task id (subtasks)
 */
export const getSubtasks = async (parentTaskId: UUID): Promise<CrudResponse<Task[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('parent_task_id', parentTaskId)
      .eq('is_deleted', false);

    return formatResponse(data || [], error);
  } catch (error) {
    return handleSupabaseError<Task[]>(error as Error);
  }
}; 
