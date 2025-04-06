import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imageEditorStyles, imageEditorColors } from '@/lib/styles/image-editor';

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
  const insets = useSafeAreaInsets();

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
            if (blob.size > 2 * 1024 * 1024) {
              throw new Error('Image size must be less than 2MB');
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
      statusBarTranslucent={true}
      presentationStyle="pageSheet"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={imageEditorStyles.container}>
          <View style={[imageEditorStyles.header, { paddingTop: insets.top > 0 ? insets.top : 16 }]}>
            <Text style={imageEditorStyles.title}>Edit Profile Picture</Text>
            <Pressable style={imageEditorStyles.closeButton} onPress={onCancel}>
              <Ionicons name="close" size={24} color={imageEditorColors.text} />
            </Pressable>
          </View>

          {error && (
            <View style={imageEditorStyles.errorContainer}>
              <Text style={imageEditorStyles.errorText}>{error}</Text>
            </View>
          )}

          <View style={{ alignItems: 'center' }}>
            <View style={imageEditorStyles.imageContainer}>
              {image ? (
                <GestureDetector gesture={composed}>
                  <Animated.View style={[imageEditorStyles.imageWrapper, animatedStyle]}>
                    <Image
                      source={{ uri: image }}
                      style={imageEditorStyles.image}
                      accessibilityLabel="Profile picture preview"
                    />
                  </Animated.View>
                </GestureDetector>
              ) : (
                <View style={imageEditorStyles.placeholder}>
                  <Ionicons name="person" size={64} color={imageEditorColors.subtleText} />
                </View>
              )}
            </View>
          </View>

          <View style={imageEditorStyles.controls}>
            <Pressable
              style={imageEditorStyles.button}
              onPress={pickImage}
              disabled={loading}>
              <Ionicons name="image-outline" size={20} color={imageEditorColors.white} />
              <Text style={imageEditorStyles.buttonText}>
                {image ? 'Change Picture' : 'Select Picture'}
              </Text>
            </Pressable>

            {image && (
              <>
                <Pressable
                  style={[imageEditorStyles.button, imageEditorStyles.deleteButton]}
                  onPress={() => setImage(null)}
                  disabled={loading}>
                  <Ionicons name="trash-outline" size={20} color={imageEditorColors.deleteText} />
                  <Text style={[imageEditorStyles.buttonText, imageEditorStyles.deleteButtonText]}>
                    Remove
                  </Text>
                </Pressable>

                <Pressable
                  style={imageEditorStyles.button}
                  onPress={handleSave}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={imageEditorColors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color={imageEditorColors.white} />
                      <Text style={imageEditorStyles.buttonText}>Save</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>

          <View style={imageEditorStyles.instructions}>
            <Text style={imageEditorStyles.instructionText}>
              • Supported formats: JPG, JPEG, PNG{'\n'}
              • Maximum file size: 2MB{'\n'}
              • Best results with square images
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
