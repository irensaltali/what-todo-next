import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/store/models/profile';
import { supabase } from '@/data/supabase';
import { debug } from '@/lib/logger';
import { User } from '@supabase/supabase-js';

/**
 * Generates a random monster image from the assets
 * @param userId Optional user ID to generate a consistent monster for the same user
 * @returns Path to a random monster image
 */
export const getRandomMonsterImage = (userId?: string | null): number => {
    let monsterNumber: number;
    
    if (userId) {
        // Generate deterministic monster number based on user ID
        // This ensures the same user always gets the same monster
        const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        monsterNumber = (hash % 50) + 1; // Between 1 and 50
        debug('Generating deterministic monster avatar', { 
            userId, 
            hash, 
            monsterNumber 
        });
    } else {
        // Random monster if no user ID provided
        monsterNumber = Math.floor(Math.random() * 50) + 1;
        debug('Generating random monster avatar', { 
            monsterNumber 
        });
    }
    
    return monsterNumber;
};

/**
 * Profile store state
 */
interface ProfileState {
    profile: Profile;
    loading: boolean;
    error: string | null;
    cachedAvatarUrl: string | null; // Store locally cached avatar
    setProfile: (profile: Profile) => void;
    updateProfile: (data: Partial<Profile>) => void;
    clearProfile: () => void;
    loadProfile: (userId: string) => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    getDefaultAvatar: () => number;
    getAvatarUrl: () => string | null; // New method to get avatar with caching
    getCurrentUser: () => Promise<User | null>; // Updated return type to match Supabase User type
}

/**
 * Profile store with Zustand and AsyncStorage persistence
 */
const useProfileStore = create<ProfileState>()(
    persist((set, get) => ({
        // Profile state
        profile: {
            id: null,
            name: null,
            avatar_url: null,
            email: null,
            created_at: null,
            updated_at: null,
        },

        // Loading state
        loading: false,
        error: null,
        cachedAvatarUrl: null,

        // Actions
        setProfile: (profile: Profile) => {
            debug('Setting profile', { profileId: profile.id, name: profile.name });
            // When setting the profile, cache the avatar URL
            set({ 
                profile,
                cachedAvatarUrl: profile.avatar_url 
            });
        },

        updateProfile: (data: Partial<Profile>) => {
            const currentState = get();
            debug('Updating profile', { 
                profileId: currentState.profile.id,
                updates: data 
            });
            
            const updatedProfile = {
                ...currentState.profile,
                ...data,
                updated_at: new Date().toISOString(),
            };
            
            // Update cached avatar only if it has changed
            const newCachedAvatarUrl = data.avatar_url !== undefined 
                ? data.avatar_url 
                : currentState.cachedAvatarUrl;
                
            set({
                profile: updatedProfile,
                cachedAvatarUrl: newCachedAvatarUrl
            });
        },

        clearProfile: () => {
            debug('Clearing profile');
            set({
                profile: {
                    id: null,
                    name: null,
                    avatar_url: null,
                    email: null,
                    created_at: null,
                    updated_at: null,
                },
                cachedAvatarUrl: null
            });
        },

        loadProfile: async (userId: string) => {
            try {
                debug('Loading profile', { userId });
                set({ loading: true, error: null });
                
                // Get user for email
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                    
                if (error) {
                    throw error;
                }
                
                if (data) {
                    const profileData = data as Profile;
                    // Add email from authentication
                    profileData.email = user?.email || null;
                    
                    debug('Profile loaded successfully', { 
                        profileId: profileData.id,
                        name: profileData.name,
                        email: profileData.email
                    });
                    
                    // Check if avatar has changed before updating cache
                    const currentCachedAvatar = get().cachedAvatarUrl;
                    const newAvatarUrl = profileData.avatar_url;
                    
                    set({ 
                        profile: profileData,
                        // Only update cached avatar if it's different
                        cachedAvatarUrl: newAvatarUrl !== currentCachedAvatar ? newAvatarUrl : currentCachedAvatar
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
                debug('Error loading profile', { userId, error: errorMessage });
                set({ error: errorMessage });
                console.error('Error loading profile:', error);
            } finally {
                set({ loading: false });
            }
        },

        setLoading: (loading: boolean) => {
            debug('Setting loading state', { loading });
            set({ loading });
        },

        setError: (error: string | null) => {
            debug('Setting error state', { error });
            set({ error });
        },
        
        // Get a random monster image as default avatar
        getDefaultAvatar: () => {
            const currentProfileId = get().profile.id;
            const avatarNumber = getRandomMonsterImage(currentProfileId);
            debug('Getting default avatar', { 
                profileId: currentProfileId,
                avatarNumber,
                timestamp: new Date().toISOString()
            });
            return avatarNumber;
        },
        
        // Get avatar with local caching
        getAvatarUrl: () => {
            const { profile, cachedAvatarUrl } = get();
            
            debug('Getting avatar URL', { 
                profileId: profile.id,
                hasCachedAvatar: !!cachedAvatarUrl,
                hasProfileAvatar: !!profile.avatar_url,
                cachedAvatarUrl,
                profileAvatarUrl: profile.avatar_url,
                timestamp: new Date().toISOString()
            });
            
            // Return cached avatar if available
            if (cachedAvatarUrl) {
                debug('Using cached avatar URL', { 
                    profileId: profile.id,
                    cachedAvatarUrl 
                });
                return cachedAvatarUrl;
            }
            
            // If no cached avatar but profile has one, cache and return it
            if (profile.avatar_url) {
                debug('Caching profile avatar URL', { 
                    profileId: profile.id,
                    newCachedUrl: profile.avatar_url 
                });
                set({ cachedAvatarUrl: profile.avatar_url });
                return profile.avatar_url;
            }
            
            debug('No avatar URL available, will use default monster', { 
                profileId: profile.id 
            });
            // Default fallback - will generate a random monster
            return null;
        },

        // Get current user
        getCurrentUser: async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                return user;
            } catch (error) {
                console.error('Error getting current user:', error);
                return null;
            }
        }
    }),
        {
            name: 'profile-storage', // unique name for the storage
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useProfileStore;
