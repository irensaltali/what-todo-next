import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '../store/models/profile';
import { supabase } from '../lib/supabase';

/**
 * Generates a random monster image from the assets
 * @param userId Optional user ID to generate a consistent monster for the same user
 * @returns Path to a random monster image
 */
export const getRandomMonsterImage = (userId?: string | null): number => {
    if (userId) {
        // Generate deterministic monster number based on user ID
        // This ensures the same user always gets the same monster
        const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hash % 50) + 1; // Between 1 and 50
    }
    
    // Random monster if no user ID provided
    return Math.floor(Math.random() * 50) + 1;
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
            created_at: null,
            updated_at: null,
        },

        // Loading state
        loading: false,
        error: null,
        cachedAvatarUrl: null,

        // Actions
        setProfile: (profile: Profile) => {
            // When setting the profile, cache the avatar URL
            set({ 
                profile,
                cachedAvatarUrl: profile.avatar_url 
            });
        },

        updateProfile: (data: Partial<Profile>) => {
            const currentState = get();
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

        clearProfile: () =>
            set({
                profile: {
                    id: null,
                    name: null,
                    avatar_url: null,
                    created_at: null,
                    updated_at: null,
                },
                cachedAvatarUrl: null
            }),

        loadProfile: async (userId: string) => {
            try {
                set({ loading: true, error: null });
                
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
                set({ error: error instanceof Error ? error.message : 'Failed to load profile' });
                console.error('Error loading profile:', error);
            } finally {
                set({ loading: false });
            }
        },

        setLoading: (loading: boolean) => set({ loading }),

        setError: (error: string | null) => set({ error }),
        
        // Get a random monster image as default avatar
        getDefaultAvatar: () => getRandomMonsterImage(get().profile.id),
        
        // Get avatar with local caching
        getAvatarUrl: () => {
            const { profile, cachedAvatarUrl } = get();
            
            // Return cached avatar if available
            if (cachedAvatarUrl) {
                return cachedAvatarUrl;
            }
            
            // If no cached avatar but profile has one, cache and return it
            if (profile.avatar_url) {
                set({ cachedAvatarUrl: profile.avatar_url });
                return profile.avatar_url;
            }
            
            // Default fallback - will generate a random monster
            return null;
        }
    }),
        {
            name: 'profile-storage', // unique name for the storage
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useProfileStore;
