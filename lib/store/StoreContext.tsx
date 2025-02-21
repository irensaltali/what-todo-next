import React, { createContext, useContext, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';
import { StoreState, StoreAction, StoreContextType, CacheState } from './types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'app_cache';

const initialState: StoreState = {
  tasks: { data: [], timestamp: 0, error: null },
  profile: { data: null, timestamp: 0, error: null },
  loading: {
    tasks: false,
    profile: false,
  },
  error: {
    tasks: null,
    profile: null,
  },
};

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.resource]: action.value,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: {
          ...state.error,
          [action.resource]: action.error,
        },
      };
    case 'SET_DATA':
      return {
        ...state,
        [action.resource]: {
          data: action.data,
          timestamp: Date.now(),
          error: null,
        },
      };
    case 'CLEAR_CACHE':
      return initialState;
    default:
      return state;
  }
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load cache from AsyncStorage on mount
  React.useEffect(() => {
    loadCache();
  }, []);

  // Save cache to AsyncStorage whenever it changes
  React.useEffect(() => {
    saveCache();
  }, [state.tasks, state.profile]);

  const loadCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached) as CacheState;
        Object.keys(parsedCache).forEach((key) => {
          const resource = key as keyof CacheState;
          const entry = parsedCache[resource];
          if (Date.now() - entry.timestamp < CACHE_TTL) {
            dispatch({ type: 'SET_DATA', resource, data: entry.data });
          }
        });
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  };

  const saveCache = async () => {
    try {
      const cache: CacheState = {
        tasks: state.tasks,
        profile: state.profile,
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  };

  const invalidateCache = useCallback((resource: keyof CacheState) => {
    dispatch({ type: 'SET_DATA', resource, data: initialState[resource].data });
  }, []);

  const refreshData = useCallback(async (resource: keyof CacheState) => {
    try {
      dispatch({ type: 'SET_LOADING', resource, value: true });
      dispatch({ type: 'SET_ERROR', resource, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let data;
      switch (resource) {
        case 'tasks':
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
          if (tasksError) throw tasksError;
          data = tasks;
          break;

        case 'profile':
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profileError) throw profileError;
          data = profile;
          break;
      }

      dispatch({ type: 'SET_DATA', resource, data });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', resource, error: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', resource, value: false });
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        ...state,
        dispatch,
        invalidateCache,
        refreshData,
      }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}