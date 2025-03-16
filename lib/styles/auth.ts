import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import * as theme from './theme';

// Define properly typed auth styles
interface AuthStyles {
  container: ViewStyle;
  content: ViewStyle;
  imageContainer: ViewStyle;
  image: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  form: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  button: ViewStyle;
  buttonDisabled: ViewStyle;
  buttonText: TextStyle;
  footer: TextStyle;
  footerLink: TextStyle;
  checkboxContainer: ViewStyle;
  checkbox: ViewStyle;
  checkboxChecked: ViewStyle;
  checkboxLabel: TextStyle;
  link: TextStyle;
}

// Create auth styles
export const authStyles = StyleSheet.create<AuthStyles>({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xxl,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xxxl,
    color: theme.colors.text.secondary,
  },
  form: {
    gap: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.text.error,
  },
  errorText: {
    color: theme.colors.text.error,
    fontSize: theme.typography.fontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    ...theme.shadows.small,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    marginTop: theme.spacing.xxxl,
    color: theme.colors.text.secondary,
  },
  footerLink: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.text.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
}); 
