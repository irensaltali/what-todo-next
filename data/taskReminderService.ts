import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';

// Define the TaskReminder interface
interface TaskReminder {
  id: UUID;
  task_id: UUID;
  reminder_time: string; // Timestamp
  created_at: string;
}

// Define types for TaskReminder creation and update
export type CreateTaskReminderInput = Omit<TaskReminder, 'id' | 'created_at'>;
export type UpdateTaskReminderInput = Partial<Omit<TaskReminder, 'id' | 'created_at'>>;

// Table name
const TABLE_NAME = 'task_reminders';

/**
 * Create a new task reminder
 */
export const createTaskReminder = async (reminderData: CreateTaskReminderInput): Promise<CrudResponse<TaskReminder>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([reminderData])
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<TaskReminder>(error as Error);
  }
};

/**
 * Get a task reminder by ID
 */
export const getTaskReminderById = async (id: UUID): Promise<CrudResponse<TaskReminder>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<TaskReminder>(error as Error);
  }
};

/**
 * Get all reminders for a task
 */
export const getTaskReminders = async (taskId: UUID): Promise<CrudResponse<TaskReminder[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('task_id', taskId);

    return formatResponse(data || [], error);
  } catch (error) {
    return handleSupabaseError<TaskReminder[]>(error as Error);
  }
};

/**
 * Update a task reminder
 */
export const updateTaskReminder = async (id: UUID, reminderData: UpdateTaskReminderInput): Promise<CrudResponse<TaskReminder>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(reminderData)
      .eq('id', id)
      .select('*')
      .single();

    return formatResponse(data, error);
  } catch (error) {
    return handleSupabaseError<TaskReminder>(error as Error);
  }
};

/**
 * Delete a task reminder
 */
export const deleteTaskReminder = async (id: UUID): Promise<CrudResponse<null>> => {
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
 * Get upcoming reminders for a user within a time range
 */
export const getUpcomingReminders = async (userId: UUID, startTime: string, endTime: string): Promise<CrudResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        tasks:task_id (id, user_id, title)
      `)
      .gte('reminder_time', startTime)
      .lte('reminder_time', endTime)
      .eq('tasks.user_id', userId);

    return formatResponse(data || [], error);
  } catch (error) {
    return handleSupabaseError<any[]>(error as Error);
  }
}; 
