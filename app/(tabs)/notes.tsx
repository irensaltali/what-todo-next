import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { StatusBar } from '../../components/StatusBar';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  color: string;
}

const COLORS = [
  '#FFD1DC', // Pink
  '#FFE5D9', // Peach
  '#D4F0F0', // Light Cyan
  '#E2ECE9', // Sage
  '#F0E6EF', // Lavender
  '#FFE4B5', // Moccasin
];

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Assign random colors to notes that don't have one
      const notesWithColors = data?.map(note => ({
        ...note,
        color: note.color || COLORS[Math.floor(Math.random() * COLORS.length)],
      })) || [];

      setNotes(notesWithColors);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title: newNote.title.trim(),
            content: newNote.content.trim(),
            color,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote({ title: '', content: '' });
      setShowNewNote(false);
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const NoteCard = ({ note }: { note: Note }) => (
    <Animated.View
      entering={FadeInDown.springify()}
      style={[styles.noteCard, { backgroundColor: note.color }]}
    >
      <Text style={styles.noteTitle}>{note.title}</Text>
      <Text style={styles.noteContent} numberOfLines={3}>
        {note.content}
      </Text>
      <Text style={styles.noteDate}>
        {format(new Date(note.updated_at), 'MMM d, yyyy')}
      </Text>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar />
      
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setShowNewNote(true)}
        >
          <Ionicons name="add" size={24} color="#1C1C1E" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {showNewNote && (
        <View style={styles.newNoteContainer}>
          <TextInput
            style={styles.newNoteTitle}
            placeholder="Note title"
            value={newNote.title}
            onChangeText={(text) => setNewNote(prev => ({ ...prev, title: text }))}
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={styles.newNoteContent}
            placeholder="Write your note..."
            value={newNote.content}
            onChangeText={(text) => setNewNote(prev => ({ ...prev, content: text }))}
            multiline
            placeholderTextColor="#8E8E93"
          />
          <View style={styles.newNoteActions}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setShowNewNote(false);
                setNewNote({ title: '', content: '' });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleCreateNote}
              disabled={saving || !newNote.title.trim()}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9F1C" />
        </View>
      ) : (
        <ScrollView
          style={styles.notesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notesContent}
        >
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
          {filteredNotes.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No notes found' : 'Create your first note'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesList: {
    flex: 1,
  },
  notesContent: {
    padding: 16,
    gap: 16,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#1C1C1E',
    opacity: 0.8,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    color: '#1C1C1E',
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  newNoteContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newNoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  newNoteContent: {
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  newNoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#FF9F1C',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});