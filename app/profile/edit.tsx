import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import useProfileStore from '@/store/profileStore';
import { ImageEditor } from '@/components/ImageEditor';
import { uploadAvatar } from '@/lib/avatar';
import { getAvatarUrl as formatAvatarUrl, preloadImage } from '@/lib/avatarUrl';
import { StatusBar } from '@/components/StatusBar';

export default function EditProfileScreen() {
  const { profile, loading: storeLoading, error: storeError, loadProfile, updateProfile, getAvatarUrl, getCurrentUser, setLoading, setError } = useProfileStore();
  const [name, setName] = useState('');
  const [loading, setLocalLoading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [imageLoadError, setImageLoadError] = useState(false);
  const [formattedAvatarUrl, setFormattedAvatarUrl] = useState('');

  // Format and cache the avatar URL only when profile changes
  useEffect(() => {
    try {
      const profileAvatarUrl = getAvatarUrl();
      if (profileAvatarUrl) {
        const formatted = formatAvatarUrl(profileAvatarUrl);
        console.log('Setting formatted avatar URL:', formatted);
        setFormattedAvatarUrl(formatted);
        
        // Attempt to preload the image
        preloadImage(formatted).then(success => {
          setImageLoadError(!success);
          if (!success) {
            console.warn('Failed to preload avatar image');
          }
        });
      } else {
        setFormattedAvatarUrl('');
      }
    } catch (e) {
      console.error('Error formatting avatar URL:', e);
      setFormattedAvatarUrl('');
      setImageLoadError(true);
    }
  }, [profile.avatar_url, profile.updated_at]);

  // Check if there are any changes to save
  const hasChanges = useMemo(() => {
    // If we don't have the original profile loaded yet, no changes
    if (originalName === null) return false;
    
    // Check if name has changed
    return name.trim() !== originalName;
  }, [name, originalName]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Update form when profile changes and store original values
    if (profile && profile.name !== undefined) {
      setName(profile.name || '');
      setOriginalName(profile.name || '');
    }
    
    // Reset image load error state when profile changes
    setImageLoadError(false);
    // Force avatar refresh
    setAvatarKey(Date.now());
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      await loadProfile(user.id);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    if (!profile || !profile.id || !hasChanges) return;

    try {
      setLocalLoading(true);
      setLocalError(null);
      setLoading(true);

      // Update profile using store method
      await updateProfile({ name: name.trim() });
      
      router.back();
    } catch (err: any) {
      const errorMessage = 'Failed to update profile';
      setLocalError(errorMessage);
      setError(errorMessage);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (uri: string) => {
    if (!profile || !profile.id) return;

    try {
      setLocalLoading(true);
      setLocalError(null);
      setImageLoadError(false);
      setLoading(true);

      const user = await getCurrentUser();
      if (!user) throw new Error('No user found');

      // Upload avatar and get public URL
      const publicUrl = await uploadAvatar(uri, user.id);
      console.log('Uploaded avatar URL:', publicUrl);

      // Preload the image to make sure it's accessible
      const preloadSuccess = await preloadImage(publicUrl);
      if (!preloadSuccess) {
        console.warn('Failed to preload image, but continuing anyway');
      }

      // Update profile avatar using store method
      await updateProfile({ avatar_url: publicUrl });
      
      // Force reload the profile to ensure the avatar is updated
      if (user.id) {
        await loadProfile(user.id);
      }
      
      // Force image cache refresh
      setAvatarKey(Date.now());
      
      setShowImageEditor(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update avatar';
      setLocalError(errorMessage);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Render the right header button based on state
  const renderHeaderRight = () => {
    if (loading || storeLoading) {
      return <ActivityIndicator size="small" color="#FF6B00" />;
    }
    
    if (!hasChanges) {
      // Return empty component when no changes
      return null;
    }
    
    return (
      <Pressable style={styles.headerButton} onPress={handleSave}>
        <Text style={styles.saveButton}>Save</Text>
      </Pressable>
    );
  };

  // Get avatar source with fallback
  const getAvatarSource = () => {
    if (imageLoadError || !formattedAvatarUrl) {
      return require('@/assets/images/monsters/monster_1.png');
    }
    return { uri: formattedAvatarUrl };
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
          headerRight: () => renderHeaderRight(),
        }}
      />

      {(error || storeError) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || storeError}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Pressable 
          style={styles.avatarContainer}
          onPress={() => setShowImageEditor(true)}
          disabled={loading || storeLoading}
        >
          <Image
            source={getAvatarSource()}
            style={styles.avatar}
            key={`avatar-${avatarKey}`}
            onError={(error) => {
              console.log('Error loading avatar image:', error.nativeEvent.error);
              setImageLoadError(true);
            }}
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
              <Text style={styles.emailText}>{profile.email || 'Loading...'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ImageEditor
        visible={showImageEditor}
        currentImage={getAvatarUrl() || null}
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
