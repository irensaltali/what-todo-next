import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Color palette for the image editor
export const imageEditorColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  primary: '#007AFF',
  text: '#000000',
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
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
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
    marginVertical: 16,
    marginHorizontal: 16,
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
    marginVertical: 20,
    width: '85%',
    backgroundColor: imageEditorColors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
  },
  instructionText: {
    fontSize: 14,
    color: imageEditorColors.subtleText,
    lineHeight: 20,
    textAlign: 'center',
  },
}); 
