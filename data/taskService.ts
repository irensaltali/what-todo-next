import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';
import { logError } from '../lib/analytics';

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

// Define priority levels
export const PRIORITY_LEVELS = [
  { level: 0, label: 'No priority' },
  { level: 1, label: 'High' },
  { level: 2, label: 'Medium' },
  { level: 3, label: 'Low' },
];

// Table name
const TABLE_NAME = 'tasks';

/**
 * Create a new task
 * 
 * @param taskData - The task data to create
 * @returns A promise with the created task or error
 */
export const createTask = async (taskData: CreateTaskInput): Promise<CrudResponse<Task>> => {
  try {
    console.log('[TaskService] Creating new task:', { title: taskData.title });
    
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

    if (error) {
      console.error('[TaskService] Error creating task:', error.message);
      logError(error as Error, { 
        context: 'taskService.createTask', 
        taskTitle: taskData.title,
        priority: taskData.priority
      });
      return { data: null, error };
    }
    
    console.log('[TaskService] Task created successfully:', { id: data?.id });
    return { data, error: null };
  } catch (error) {
    console.error('[TaskService] Exception in createTask:', (error as Error).message);
    logError(error as Error, { context: 'taskService.createTask' });
    return handleSupabaseError<Task>(error as Error);
  }
};

/**
 * Get a task by ID
 * 
 * @param id - The task ID to retrieve
 * @returns A promise with the task or error
 */
export const getTaskById = async (id: UUID): Promise<CrudResponse<Task>> => {
  try {
    console.log('[TaskService] Getting task by ID:', id);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[TaskService] Error fetching task:', error.message);
      logError(error as Error, { context: 'taskService.getTaskById', taskId: id });
      return { data: null, error };
    }
    
    console.log('[TaskService] Task retrieved successfully');
    return { data, error: null };
  } catch (error) {
    console.error('[TaskService] Exception in getTaskById:', (error as Error).message);
    logError(error as Error, { context: 'taskService.getTaskById', taskId: id });
    return handleSupabaseError<Task>(error as Error);
  }
};

/**
 * Get all tasks for a user
 * 
 * @param userId - The user ID to get tasks for
 * @returns A promise with the tasks or error
 */
export const getUserTasks = async (userId: UUID): Promise<CrudResponse<Task[]>> => {
  try {
    console.log('[TaskService] Getting tasks for user:', userId);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (error) {
      console.error('[TaskService] Error fetching user tasks:', error.message);
      logError(error as Error, { context: 'taskService.getUserTasks', userId });
      return { data: [], error };
    }
    
    console.log('[TaskService] User tasks retrieved successfully:', { count: data?.length || 0 });
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[TaskService] Exception in getUserTasks:', (error as Error).message);
    logError(error as Error, { context: 'taskService.getUserTasks', userId });
    return handleSupabaseError<Task[]>(error as Error);
  }
};

/**
 * Update a task
 * 
 * @param id - The task ID to update
 * @param taskData - The task data to update
 * @returns A promise with the updated task or error
 */
export const updateTask = async (id: UUID, taskData: UpdateTaskInput): Promise<CrudResponse<Task>> => {
  try {
    console.log('[TaskService] Updating task:', { id, fields: Object.keys(taskData) });
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(taskData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[TaskService] Error updating task:', error.message);
      logError(error as Error, { context: 'taskService.updateTask', taskId: id });
      return { data: null, error };
    }
    
    console.log('[TaskService] Task updated successfully');
    return { data, error: null };
  } catch (error) {
    console.error('[TaskService] Exception in updateTask:', (error as Error).message);
    logError(error as Error, { context: 'taskService.updateTask', taskId: id });
    return handleSupabaseError<Task>(error as Error);
  }
};

/**
 * Delete a task (soft delete)
 * 
 * @param id - The task ID to soft delete
 * @returns A promise with the soft-deleted task or error
 */
export const softDeleteTask = async (id: UUID): Promise<CrudResponse<Task>> => {
  console.log('[TaskService] Soft deleting task:', id);
  return updateTask(id, { is_deleted: true });
};

/**
 * Permanently delete a task
 * 
 * @param id - The task ID to permanently delete
 * @returns A promise with null or error
 */
export const hardDeleteTask = async (id: UUID): Promise<CrudResponse<null>> => {
  try {
    console.log('[TaskService] Hard deleting task:', id);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[TaskService] Error deleting task:', error.message);
      logError(error as Error, { context: 'taskService.hardDeleteTask', taskId: id });
      return { data: null, error };
    }
    
    console.log('[TaskService] Task permanently deleted');
    return { data: null, error: null };
  } catch (error) {
    console.error('[TaskService] Exception in hardDeleteTask:', (error as Error).message);
    logError(error as Error, { context: 'taskService.hardDeleteTask', taskId: id });
    return handleSupabaseError<null>(error as Error);
  }
};

/**
 * Get tasks by parent task id (subtasks)
 * 
 * @param parentTaskId - The parent task ID to get subtasks for
 * @returns A promise with the subtasks or error
 */
export const getSubtasks = async (parentTaskId: UUID): Promise<CrudResponse<Task[]>> => {
  try {
    console.log('[TaskService] Getting subtasks for parent task:', parentTaskId);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('parent_task_id', parentTaskId)
      .eq('is_deleted', false);

    if (error) {
      console.error('[TaskService] Error fetching subtasks:', error.message);
      logError(error as Error, { context: 'taskService.getSubtasks', parentTaskId });
      return { data: [], error };
    }
    
    console.log('[TaskService] Subtasks retrieved successfully:', { count: data?.length || 0 });
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[TaskService] Exception in getSubtasks:', (error as Error).message);
    logError(error as Error, { context: 'taskService.getSubtasks', parentTaskId });
    return handleSupabaseError<Task[]>(error as Error);
  }
}; 
