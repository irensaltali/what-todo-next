import { useEffect, useCallback } from 'react';
import { useStore } from '../store/StoreContext';
import { Note } from '../store/models/note';
import { supabase } from '../supabase';

export function useNotes() {
  const { notes, loading, error, dispatch, refreshData } = useStore();

  useEffect(() => {
    if (!notes.data.length && !loading.notes && !error.notes) {
      refreshData('notes');
    }
  }, []);

  const createNote = useCallback(async (note: Partial<Note>) => {
    try {
      dispatch({ type: 'SET_LOADING', resource: 'notes', value: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...note, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      dispatch({
        type: 'SET_DATA',
        resource: 'notes',
        data: [data, ...notes.data],
      });

      return data;
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        resource: 'notes',
        error: error.message,
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', resource: 'notes', value: false });
    }
  }, [notes.data]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      dispatch({ type: 'SET_LOADING', resource: 'notes', value: true });

      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({
        type: 'SET_DATA',
        resource: 'notes',
        data: notes.data.map(note => 
          note.id === id ? { ...note, ...data } : note
        ),
      });

      return data;
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        resource: 'notes',
        error: error.message,
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', resource: 'notes', value: false });
    }
  }, [notes.data]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', resource: 'notes', value: true });

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({
        type: 'SET_DATA',
        resource: 'notes',
        data: notes.data.filter(note => note.id !== id),
      });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        resource: 'notes',
        error: error.message,
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', resource: 'notes', value: false });
    }
  }, [notes.data]);

  return {
    notes: notes.data,
    loading: loading.notes,
    error: error.notes,
    refreshNotes: () => refreshData('notes'),
    createNote,
    updateNote,
    deleteNote,
  };
}