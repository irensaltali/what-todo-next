import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/data/supabase';
import { getAvatarUrl } from '@/lib/avatarUrl';
import { ImageEditor } from '@/components/ImageEditor';
import { uploadAvatar } from '@/lib/avatar';
import { StatusBar } from '@/components/StatusBar';

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setName(data.name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      router.back();
    } catch (err: any) {
      setError('Failed to update profile');
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (uri: string) => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upload avatar and get public URL
      const publicUrl = await uploadAvatar(uri, user.id);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      await fetchProfile();
      setShowImageEditor(false);
    } catch (err: any) {
      setError('Failed to update avatar');
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerLeft: () => (
            <Pressable
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="#1C1C1E" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              style={styles.headerButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FF6B00" />
              ) : (
                <Text style={styles.saveButton}>Save</Text>
              )}
            </Pressable>
          ),
        }}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Pressable 
          style={styles.avatarContainer}
          onPress={() => setShowImageEditor(true)}
          disabled={loading}
        >
          <Image
            source={{ uri: getAvatarUrl(profile?.avatar_url) }}
            style={styles.avatar}
          />
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarHint}>Tap to change</Text>
          </View>
        </Pressable>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#6C757D"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.emailContainer}>
              <Text style={styles.emailText}>{userEmail || 'Loading...'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ImageEditor
        visible={showImageEditor}
        currentImage={profile?.avatar_url ? getAvatarUrl(profile.avatar_url) : null}
        onImageSelect={handleUpdateAvatar}
        onCancel={() => setShowImageEditor(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerButton: {
    padding: 8,
  },
  saveButton: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  avatarHint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  form: {
    width: '100%',
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emailContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  emailText: {
    fontSize: 16,
    color: '#6C757D',
  },
});
