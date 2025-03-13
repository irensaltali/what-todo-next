import { Platform } from 'react-native';
import { supabase } from '../data/supabase';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const BUCKET_NAME = 'avatar';

interface UploadOptions {
  onProgress?: (progress: number) => void;
}

export class AvatarUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvatarUploadError';
  }
}

export async function uploadAvatar(
  uri: string,
  userId: string,
  options?: UploadOptions
): Promise<string> {
  try {
    // Validate file type and size
    let fileType: string;
    let fileData: Blob;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      fileData = await response.blob();
      fileType = fileData.type;

      // Validate file size
      if (fileData.size > MAX_FILE_SIZE) {
        throw new AvatarUploadError('File size must be less than 2MB');
      }
    } else {
      // For native platforms, we need to infer the type from the URI
      fileType = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      // For native platforms, we'll validate size after getting the blob
      const response = await fetch(uri);
      fileData = await response.blob();
      
      if (fileData.size > MAX_FILE_SIZE) {
        throw new AvatarUploadError('File size must be less than 2MB');
      }
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new AvatarUploadError('Invalid file type. Only JPG, JPEG, and PNG files are allowed');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = fileType.split('/')[1];
    const fileName = `${userId}-${timestamp}.${extension}`;

    // Remove existing avatar if any
    const { data: existingFiles } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list(`${userId}`);

    if (existingFiles && existingFiles.length > 0) {
      await Promise.all(
        existingFiles.map(file => 
          supabase
            .storage
            .from(BUCKET_NAME)
            .remove([`${userId}/${file.name}`])
        )
      );
    }

    // Upload new avatar
    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(`${userId}/${fileName}`, fileData, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new AvatarUploadError(uploadError.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${userId}/${fileName}`);

    return publicUrl;
  } catch (error) {
    if (error instanceof AvatarUploadError) {
      throw error;
    }
    throw new AvatarUploadError('Failed to upload avatar. Please try again.');
  }
}
