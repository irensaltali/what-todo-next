import { supabase } from './supabase';
import { UUID, CrudResponse, handleSupabaseError, formatResponse } from './utils';
import { logError } from '../lib/analytics';

/**
 * Task Reminder model
 * Represents a reminder notification for a task
 */
interface TaskReminder {
  id: UUID;
  task_id: UUID;
  reminder_time: string; // ISO 8601 timestamp
  created_at: string;
}

// Define types for TaskReminder creation and update
export type CreateTaskReminderInput = Omit<TaskReminder, 'id' | 'created_at'>;
export type UpdateTaskReminderInput = Partial<Omit<TaskReminder, 'id' | 'created_at'>>;

// Table name in Supabase
const TABLE_NAME = 'task_reminders';

/**
 * Create a new task reminder
 * 
 * @param reminderData - The reminder data to create
 * @returns A promise with the created reminder or error
 */
export const createTaskReminder = async (reminderData: CreateTaskReminderInput): Promise<CrudResponse<TaskReminder>> => {
  try {
    console.log('[ReminderService] Creating new reminder for task:', reminderData.task_id);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([reminderData])
      .select('*')
      .single();

    if (error) {
      console.error('[ReminderService] Error creating reminder:', error.message);
      logError(error as Error, { 
        context: 'taskReminderService.createTaskReminder', 
        taskId: reminderData.task_id 
      });
      return { data: null, error };
    }
    
    console.log('[ReminderService] Reminder created successfully:', { id: data?.id });
    return { data, error: null };
  } catch (error) {
    console.error('[ReminderService] Exception in createTaskReminder:', (error as Error).message);
    logError(error as Error, { 
      context: 'taskReminderService.createTaskReminder',
      taskId: reminderData.task_id
    });
    return handleSupabaseError<TaskReminder>(error as Error);
  }
};

/**
 * Get a task reminder by ID
 * 
 * @param id - The reminder ID to retrieve
 * @returns A promise with the reminder or error
 */
export const getTaskReminderById = async (id: UUID): Promise<CrudResponse<TaskReminder>> => {
  try {
    console.log('[ReminderService] Getting reminder by ID:', id);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[ReminderService] Error fetching reminder:', error.message);
      logError(error as Error, { context: 'taskReminderService.getTaskReminderById', reminderId: id });
      return { data: null, error };
    }
    
    console.log('[ReminderService] Reminder retrieved successfully');
    return { data, error: null };
  } catch (error) {
    console.error('[ReminderService] Exception in getTaskReminderById:', (error as Error).message);
    logError(error as Error, { context: 'taskReminderService.getTaskReminderById', reminderId: id });
    return handleSupabaseError<TaskReminder>(error as Error);
  }
};

/**
 * Get all reminders for a task
 * 
 * @param taskId - The task ID to get reminders for
 * @returns A promise with the reminders or error
 */
export const getTaskReminders = async (taskId: UUID): Promise<CrudResponse<TaskReminder[]>> => {
  try {
    console.log('[ReminderService] Getting reminders for task:', taskId);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('task_id', taskId);

    if (error) {
      console.error('[ReminderService] Error fetching task reminders:', error.message);
      logError(error as Error, { context: 'taskReminderService.getTaskReminders', taskId });
      return { data: [], error };
    }
    
    console.log('[ReminderService] Task reminders retrieved successfully:', { count: data?.length || 0 });
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[ReminderService] Exception in getTaskReminders:', (error as Error).message);
    logError(error as Error, { context: 'taskReminderService.getTaskReminders', taskId });
    return handleSupabaseError<TaskReminder[]>(error as Error);
  }
};

/**
 * Update a task reminder
 * 
 * @param id - The reminder ID to update
 * @param reminderData - The reminder data to update
 * @returns A promise with the updated reminder or error
 */
export const updateTaskReminder = async (id: UUID, reminderData: UpdateTaskReminderInput): Promise<CrudResponse<TaskReminder>> => {
  try {
    console.log('[ReminderService] Updating reminder:', { id, fields: Object.keys(reminderData) });
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(reminderData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[ReminderService] Error updating reminder:', error.message);
      logError(error as Error, { context: 'taskReminderService.updateTaskReminder', reminderId: id });
      return { data: null, error };
    }
    
    console.log('[ReminderService] Reminder updated successfully');
    return { data, error: null };
  } catch (error) {
    console.error('[ReminderService] Exception in updateTaskReminder:', (error as Error).message);
    logError(error as Error, { context: 'taskReminderService.updateTaskReminder', reminderId: id });
    return handleSupabaseError<TaskReminder>(error as Error);
  }
};

/**
 * Delete a task reminder
 * 
 * @param id - The reminder ID to delete
 * @returns A promise with null or error
 */
export const deleteTaskReminder = async (id: UUID): Promise<CrudResponse<null>> => {
  try {
    console.log('[ReminderService] Deleting reminder:', id);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[ReminderService] Error deleting reminder:', error.message);
      logError(error as Error, { context: 'taskReminderService.deleteTaskReminder', reminderId: id });
      return { data: null, error };
    }
    
    console.log('[ReminderService] Reminder deleted successfully');
    return { data: null, error: null };
  } catch (error) {
    console.error('[ReminderService] Exception in deleteTaskReminder:', (error as Error).message);
    logError(error as Error, { context: 'taskReminderService.deleteTaskReminder', reminderId: id });
    return handleSupabaseError<null>(error as Error);
  }
};

/**
 * Get upcoming reminders for a user within a time range
 * 
 * @param userId - The user ID to get reminders for
 * @param startTime - Start time range in ISO 8601 format
 * @param endTime - End time range in ISO 8601 format
 * @returns A promise with the reminders and their associated tasks or error
 */
export const getUpcomingReminders = async (userId: UUID, startTime: string, endTime: string): Promise<CrudResponse<any[]>> => {
  try {
    console.log('[ReminderService] Getting upcoming reminders for user:', userId, { startTime, endTime });
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        tasks:task_id (id, user_id, title)
      `)
      .gte('reminder_time', startTime)
      .lte('reminder_time', endTime)
      .eq('tasks.user_id', userId);

    if (error) {
      console.error('[ReminderService] Error fetching upcoming reminders:', error.message);
      logError(error as Error, { 
        context: 'taskReminderService.getUpcomingReminders', 
        userId,
        timeRange: { startTime, endTime } 
      });
      return { data: [], error };
    }
    
    console.log('[ReminderService] Upcoming reminders retrieved successfully:', { count: data?.length || 0 });
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[ReminderService] Exception in getUpcomingReminders:', (error as Error).message);
    logError(error as Error, { 
      context: 'taskReminderService.getUpcomingReminders',
      userId,
      timeRange: { startTime, endTime }
    });
    return handleSupabaseError<any[]>(error as Error);
  }
}; 
