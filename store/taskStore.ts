import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/data/supabase';

// Define the TaskStatus type based on the database enum
export type TaskStatus = 'ongoing' | 'completed' | 'cancelled';

// Define the Task interface based on the database schema
export interface Task {
  id: string;
  user_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: number | null;
  outcome_value: string | null;
  difficulty: number | null;
  is_recursive: boolean;
  recursion_count: number | null;
  recursion_end: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  status: TaskStatus;
}

// Define the Tag interface
export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

// Define the List interface
export interface List {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

// Define filter parameters type
export interface TaskFilterParams {
  status?: TaskStatus;
  date?: Date;
  dateRange?: {
    start: Date;
    end: Date;
  };
  listId?: string;
  weekOf?: Date;
}

// Debug logging utility
const debugLog = (action: string, data?: any) => {
  if (__DEV__) {
    console.log(`[TaskStore] ${action}`, data ? data : '');
  }
};

// Define the store state interface
interface TaskState {
  tasks: Task[];
  tags: Tag[];
  lists: List[];
  taskListRelations: { task_id: string; list_id: string }[];
  isLoading: boolean;
  error: string | null;
  isDebug: boolean;
  
  // Task Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  clearTasks: () => Promise<void>;

  // Helper functions
  areTasksLoaded: () => boolean;
  fetchTaskListRelations: () => Promise<void>;

  // Unified Filter Action
  filterTasks: (params: TaskFilterParams) => Promise<Task[]>;

  // Tag Actions
  fetchTags: () => Promise<void>;
  addTag: (tag: Omit<Tag, 'id' | 'created_at'>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTaskTag: (taskId: string, tagId: string) => Promise<void>;
  removeTaskTag: (taskId: string, tagId: string) => Promise<void>;

  // List Actions
  fetchLists: () => Promise<void>;
  addList: (list: Omit<List, 'id' | 'created_at'>) => Promise<void>;
  updateList: (id: string, updates: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addTaskToList: (taskId: string, listId: string) => Promise<void>;
  removeTaskFromList: (taskId: string, listId: string) => Promise<void>;

  // Reminder Actions
  addTaskReminder: (taskId: string, reminderTime: string) => Promise<void>;
  removeTaskReminder: (reminderId: string) => Promise<void>;

  // Utility Actions
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setDebug: (isDebug: boolean) => void;
}

// Create the store with persistence
export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      tags: [],
      lists: [],
      taskListRelations: [],
      isLoading: false,
      error: null,
      isDebug: __DEV__,

      fetchTasks: async () => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

          if (error) throw error;

          debugLog('Fetched tasks', data);
          set({ tasks: data || [] });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
          debugLog('Error fetching tasks', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      addTask: async (task) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const newTask = {
            ...task,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: false,
          };

          const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()
            .single();

          if (error) throw error;

          debugLog('Added task', data);
          set((state) => ({
            tasks: [data, ...state.tasks],
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
          debugLog('Error adding task', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      updateTask: async (id: string, updates: Partial<Task>) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase
            .from('tasks')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          debugLog('Updated task', data);
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? data : task
            ),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
          debugLog('Error updating task', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      deleteTask: async (id: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('tasks')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', id);

          if (error) throw error;

          debugLog('Deleted task', { id });
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
          debugLog('Error deleting task', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      toggleTaskStatus: async (id: string, status: TaskStatus) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase
            .from('tasks')
            .update({
              status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          debugLog('Updated task status', data);
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? data : task
            ),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
          debugLog('Error updating task status', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      clearTasks: async () => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const { error } = await supabase
            .from('tasks')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('is_deleted', false);

          if (error) throw error;

          debugLog('Cleared all tasks');
          set({ tasks: [] });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to clear tasks';
          debugLog('Error clearing tasks', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      // Helper function to check if tasks are loaded
      areTasksLoaded: () => {
        const state = get();
        return state.tasks.length > 0;
      },

      // Tag Actions
      fetchTags: async () => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const { data, error } = await supabase
            .from('tags')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          debugLog('Fetched tags', data);
          set({ tags: data || [] });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tags';
          debugLog('Error fetching tags', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      addTag: async (tag) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const newTag = {
            ...tag,
            user_id: user.id,
            created_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('tags')
            .insert([newTag])
            .select()
            .single();

          if (error) throw error;

          debugLog('Added tag', data);
          set((state) => ({
            tags: [data, ...state.tags],
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add tag';
          debugLog('Error adding tag', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      updateTag: async (id: string, updates: Partial<Tag>) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase
            .from('tags')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          debugLog('Updated tag', data);
          set((state) => ({
            tags: state.tags.map((tag) =>
              tag.id === id ? data : tag
            ),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update tag';
          debugLog('Error updating tag', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      deleteTag: async (id: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          // First remove all task_tag associations
          const { error: taskTagError } = await supabase
            .from('task_tags')
            .delete()
            .eq('tag_id', id);

          if (taskTagError) throw taskTagError;

          // Then delete the tag
          const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', id);

          if (error) throw error;

          debugLog('Deleted tag', { id });
          set((state) => ({
            tags: state.tags.filter((tag) => tag.id !== id),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete tag';
          debugLog('Error deleting tag', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      addTaskTag: async (taskId: string, tagId: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('task_tags')
            .insert([{ task_id: taskId, tag_id: tagId }]);

          if (error) throw error;

          debugLog('Added task tag', { taskId, tagId });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add task tag';
          debugLog('Error adding task tag', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      removeTaskTag: async (taskId: string, tagId: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('task_tags')
            .delete()
            .eq('task_id', taskId)
            .eq('tag_id', tagId);

          if (error) throw error;

          debugLog('Removed task tag', { taskId, tagId });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove task tag';
          debugLog('Error removing task tag', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      // List Actions
      fetchLists: async () => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const { data, error } = await supabase
            .from('lists')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          debugLog('Fetched lists', data);
          set({ lists: data || [] });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch lists';
          debugLog('Error fetching lists', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      addList: async (list) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const newList = {
            ...list,
            user_id: user.id,
            created_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('lists')
            .insert([newList])
            .select()
            .single();

          if (error) throw error;

          debugLog('Added list', data);
          set((state) => ({
            lists: [data, ...state.lists],
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add list';
          debugLog('Error adding list', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      updateList: async (id: string, updates: Partial<List>) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase
            .from('lists')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          debugLog('Updated list', data);
          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === id ? data : list
            ),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update list';
          debugLog('Error updating list', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      deleteList: async (id: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          // First remove all task_list associations
          const { error: taskListError } = await supabase
            .from('task_lists')
            .delete()
            .eq('list_id', id);

          if (taskListError) throw taskListError;

          // Then delete the list
          const { error } = await supabase
            .from('lists')
            .delete()
            .eq('id', id);

          if (error) throw error;

          debugLog('Deleted list', { id });
          set((state) => ({
            lists: state.lists.filter((list) => list.id !== id),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete list';
          debugLog('Error deleting list', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      addTaskToList: async (taskId: string, listId: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('task_lists')
            .insert([{ task_id: taskId, list_id: listId }]);

          if (error) throw error;

          debugLog('Added task to list', { taskId, listId });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add task to list';
          debugLog('Error adding task to list', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      removeTaskFromList: async (taskId: string, listId: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('task_lists')
            .delete()
            .eq('task_id', taskId)
            .eq('list_id', listId);

          if (error) throw error;

          debugLog('Removed task from list', { taskId, listId });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove task from list';
          debugLog('Error removing task from list', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      // Reminder Actions
      addTaskReminder: async (taskId: string, reminderTime: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('task_reminders')
            .insert([{ task_id: taskId, reminder_time: reminderTime }]);

          if (error) throw error;

          debugLog('Added task reminder', { taskId, reminderTime });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add task reminder';
          debugLog('Error adding task reminder', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      removeTaskReminder: async (reminderId: string) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { error } = await supabase
            .from('task_reminders')
            .delete()
            .eq('id', reminderId);

          if (error) throw error;

          debugLog('Removed task reminder', { reminderId });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove task reminder';
          debugLog('Error removing task reminder', errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      // Utility Actions
      setError: (error: string | null) => {
        debugLog('Setting error', { error });
        set({ error });
      },

      setLoading: (isLoading: boolean) => {
        debugLog('Setting loading state', { isLoading });
        set({ isLoading });
      },

      setDebug: (isDebug: boolean) => {
        debugLog('Setting debug mode', { isDebug });
        set({ isDebug });
      },
      // Unified Filter Implementation
      filterTasks: async (params: TaskFilterParams): Promise<Task[]> => {
        const { setLoading, setError, areTasksLoaded, tasks, taskListRelations, fetchTaskListRelations } = get();
        setLoading(true);
        setError(null);

        try {
          // If tasks are loaded, filter locally
          if (areTasksLoaded()) {
            debugLog('Using local tasks for filtering', params);
            // Start with all non-deleted tasks
            let filteredTasks = tasks.filter(task => !task.is_deleted);

            // If no params provided, return all non-deleted tasks
            if (Object.keys(params).length === 0) {
              return filteredTasks;
            }

            // Filter by status
            if (params.status) {
              filteredTasks = filteredTasks.filter(task => task.status === params.status);
            }

            // Filter by specific date
            if (params.date) {
              const startOfDay = new Date(params.date);
              startOfDay.setHours(0, 0, 0, 0);
              const endOfDay = new Date(params.date);
              endOfDay.setHours(23, 59, 59, 999);

              filteredTasks = filteredTasks.filter(task => {
                if (!task.deadline) return false;
                const taskDate = new Date(task.deadline);
                return taskDate >= startOfDay && taskDate <= endOfDay;
              });
            }

            // Filter by date range
            if (params.dateRange) {
              filteredTasks = filteredTasks.filter(task => {
                if (!task.deadline) return false;
                const taskDate = new Date(task.deadline);
                return taskDate >= params.dateRange!.start && taskDate <= params.dateRange!.end;
              });
            }

            // Filter by week
            if (params.weekOf) {
              const startOfWeek = new Date(params.weekOf);
              startOfWeek.setDate(params.weekOf.getDate() - params.weekOf.getDay());
              startOfWeek.setHours(0, 0, 0, 0);

              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              endOfWeek.setHours(23, 59, 59, 999);

              filteredTasks = filteredTasks.filter(task => {
                if (!task.deadline) return false;
                const taskDate = new Date(task.deadline);
                return taskDate >= startOfWeek && taskDate <= endOfWeek;
              });
            }

            // Filter by list
            if (params.listId) {
              if (taskListRelations.length === 0) {
                await fetchTaskListRelations();
              }

              const taskIdsInList = taskListRelations
                .filter(relation => relation.list_id === params.listId)
                .map(relation => relation.task_id);

              filteredTasks = filteredTasks.filter(task => 
                taskIdsInList.includes(task.id)
              );
            }

            return filteredTasks;
          }

          // If tasks are not loaded, fetch from database with appropriate filters
          debugLog('Fetching filtered tasks from database', params);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          // Base query for tasks
          const baseQuery = supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_deleted', false);

          // If list ID is provided, we need to join with task_lists
          if (params.listId) {
            const { data: listData, error: listError } = await supabase
              .from('tasks')
              .select('*, task_lists!inner(*)')
              .eq('user_id', user.id)
              .eq('is_deleted', false)
              .eq('task_lists.list_id', params.listId)
              .order('created_at', { ascending: false });

            if (listError) throw listError;
            return (listData || []) as Task[];
          }

          // If no params provided, return all non-deleted tasks
          if (Object.keys(params).length === 0) {
            const { data, error } = await baseQuery.order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
          }

          let query = baseQuery;

          // Apply filters to query
          if (params.status) {
            query = query.eq('status', params.status);
          }

          if (params.date) {
            const startOfDay = new Date(params.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(params.date);
            endOfDay.setHours(23, 59, 59, 999);
            query = query
              .gte('deadline', startOfDay.toISOString())
              .lte('deadline', endOfDay.toISOString());
          }

          if (params.dateRange) {
            query = query
              .gte('deadline', params.dateRange.start.toISOString())
              .lte('deadline', params.dateRange.end.toISOString());
          }

          if (params.weekOf) {
            const startOfWeek = new Date(params.weekOf);
            startOfWeek.setDate(params.weekOf.getDate() - params.weekOf.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            query = query
              .gte('deadline', startOfWeek.toISOString())
              .lte('deadline', endOfWeek.toISOString());
          }

          const { data, error } = await query.order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to filter tasks';
          setError(errorMessage);
          return [];
        } finally {
          setLoading(false);
        }
      },

      fetchTaskListRelations: async () => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('No authenticated user');
          }

          const { data, error } = await supabase
            .from('task_lists')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          debugLog('Fetched task-list relations', data);
          set({ taskListRelations: data || [] });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task-list relations';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 
