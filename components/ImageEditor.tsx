import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ImageEditorProps {
  visible: boolean;
  currentImage: string | null;
  onImageSelect: (uri: string) => Promise<void>;
  onCancel: () => void;
}

export function ImageEditor({ visible, currentImage, onImageSelect, onCancel }: ImageEditorProps) {
  const [image, setImage] = useState<string | null>(currentImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(2, e.scale));
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const rotateGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = e.rotation;
    })
    .onEnd(() => {
      rotation.value = withSpring(0);
    });

  const composed = Gesture.Simultaneous(pinchGesture, rotateGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${(rotation.value * 180) / Math.PI}deg` },
    ],
  }));

  const pickImage = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const { uri } = result.assets[0];
        
        // Validate file size (5MB limit)
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            if (blob.size > 5 * 1024 * 1024) {
              throw new Error('Image size must be less than 5MB');
            }
          } catch (err) {
            throw new Error('Failed to process image. Please try a different one.');
          }
        }

        try {
          // Resize image if needed
          const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1000, height: 1000 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );

          setImage(manipResult.uri);
        } catch (err) {
          throw new Error('Failed to process image. Please try a different one.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to pick image');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (image) {
      try {
        setLoading(true);
        setError(null);
        await onImageSelect(image);
      } catch (err: any) {
        setError(err.message || 'Failed to save image');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile Picture</Text>
          <Pressable style={styles.closeButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="#1C1C1E" />
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.imageContainer}>
          {image ? (
            <GestureDetector gesture={composed}>
              <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  accessibilityLabel="Profile picture preview"
                />
              </Animated.View>
            </GestureDetector>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="person" size={64} color="#8E8E93" />
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <Pressable
            style={styles.button}
            onPress={pickImage}
            disabled={loading}>
            <Ionicons name="image-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {image ? 'Change Picture' : 'Select Picture'}
            </Text>
          </Pressable>

          {image && (
            <>
              <Pressable
                style={[styles.button, styles.deleteButton]}
                onPress={() => setImage(null)}
                disabled={loading}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={[styles.buttonText, styles.deleteButtonText]}>
                  Remove
                </Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={handleSave}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save</Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            • Supported formats: JPG, PNG{'\n'}
            • Maximum file size: 5MB{'\n'}
            • Best results with square images
          </Text>
        </View>
      </View>
    </Modal>
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
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
  imageContainer: {
    aspectRatio: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    padding: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  instructions: {
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});