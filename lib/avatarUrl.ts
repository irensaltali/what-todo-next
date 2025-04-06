import { supabase } from '../data/supabase';
import { Image } from 'react-native';

/**
 * Transforms a raw storage path or URL into a properly formatted public URL for avatar images
 * @param avatarUrl The raw avatar URL or storage path
 * @returns A properly formatted public URL for the avatar image
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    // The default avatar is now handled by the component directly
    return '';
  }

  try {
    // Use a full timestamp for cache busting (not truncated)
    const cacheBuster = Date.now(); 

    // If it's already a full URL (e.g., Unsplash or other external URL), return as is with cache buster
    if (avatarUrl.startsWith('http')) {
      // Don't add cache buster if it already has one
      if (avatarUrl.includes('t=')) {
        return avatarUrl;
      }
      
      // Add a cache-busting parameter
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}t=${cacheBuster}`;
    }

    // Clean up the path and ensure proper structure
    let filePath = avatarUrl;
    
    // Remove any leading slashes
    filePath = filePath.replace(/^\/+/, '');
    
    // Remove bucket name if it's included
    if (filePath.startsWith('avatar/')) {
      filePath = filePath.substring(7); // Remove 'avatar/'
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatar')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      console.error('Failed to get public URL for avatar:', filePath);
      return '';
    }

    // Don't add cache buster if it already has one
    if (publicUrl.includes('t=')) {
      return publicUrl;
    }

    // Add a cache-busting parameter
    const separator = publicUrl.includes('?') ? '&' : '?';
    return `${publicUrl}${separator}t=${cacheBuster}`;
  } catch (error) {
    console.error('Error formatting avatar URL:', error);
    return '';
  }
}

/**
 * Generates a storage path for a new avatar file
 * @param userId The user's ID
 * @param fileExtension The file extension (e.g., 'jpg', 'png')
 * @returns A unique storage path for the avatar
 */
export function generateAvatarPath(userId: string, fileExtension: string): string {
  const timestamp = Date.now();
  return `${userId}/${userId}-${timestamp}.${fileExtension}`;
}

/**
 * Pre-caches an image to ensure it's available
 * @param url The image URL to pre-cache
 * @returns A promise that resolves when the image is cached
 */
export function preloadImage(url: string): Promise<boolean> {
  if (!url) return Promise.resolve(false);
  
  return new Promise((resolve) => {
    Image.prefetch(url)
      .then(() => resolve(true))
      .catch((error) => {
        console.warn('Image preload failed:', error);
        resolve(false);
      });
  });
}
