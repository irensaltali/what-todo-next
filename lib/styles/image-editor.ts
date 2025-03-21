import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import * as theme from './theme';

// Color palette for the image editor
export const imageEditorColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  primary: '#FF6B00',
  text: '#1C1C1E',
  subtleText: '#8E8E93',
  error: '#FF3B30',
  white: '#FFFFFF',
  errorBackground: '#FFE5E5',
  deleteText: '#FF3B30',
};

// Define types for all styles used in the component
export interface ImageEditorStyles {
  // Container & Layout
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: ViewStyle;

  // Error display
  errorContainer: ViewStyle;
  errorText: TextStyle;

  // Image container
  imageContainer: ViewStyle;
  imageWrapper: ViewStyle;
  image: ImageStyle;
  placeholder: ViewStyle;

  // Controls
  controls: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  deleteButton: ViewStyle;
  deleteButtonText: TextStyle;

  // Instructions
  instructions: ViewStyle;
  instructionText: TextStyle;
}

// Create the styles
export const imageEditorStyles = StyleSheet.create<ImageEditorStyles>({
  container: {
    flex: 1,
    backgroundColor: imageEditorColors.background,
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
    color: imageEditorColors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: imageEditorColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: imageEditorColors.errorBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: imageEditorColors.error,
  },
  errorText: {
    color: imageEditorColors.error,
    fontSize: 14,
  },
  imageContainer: {
    aspectRatio: 1,
    margin: 16,
    backgroundColor: imageEditorColors.surface,
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
    backgroundColor: imageEditorColors.background,
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
    backgroundColor: imageEditorColors.primary,
    borderRadius: 12,
    padding: 16,
  },
  buttonText: {
    color: imageEditorColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: imageEditorColors.errorBackground,
  },
  deleteButtonText: {
    color: imageEditorColors.deleteText,
  },
  instructions: {
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: imageEditorColors.subtleText,
    lineHeight: 20,
  },
}); 
