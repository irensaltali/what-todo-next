import { supabase } from './supabase';

const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

/**
 * Transforms a raw storage path or URL into a properly formatted public URL for avatar images
 * @param avatarUrl The raw avatar URL or storage path
 * @returns A properly formatted public URL for the avatar image
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    return DEFAULT_AVATAR_URL;
  }

  // If it's already a full URL (e.g., Unsplash or other external URL), return as is
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
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

  return publicUrl;
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