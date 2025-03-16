# ToDoNext Theming System

This document describes how to use the styling system in the ToDoNext app.

## Overview

The app uses a centralized theming system to ensure consistent styles across all components. The system supports:

- Light and dark mode
- Consistent colors, spacing, typography, and shadows
- Easy to use theme hooks
- Type-safe style definitions

## Theme Elements

The theme system is built around several key elements:

### Colors

```typescript
// Example usage
import { colors } from '../lib/styles';

// Primary color
colors.primary // #FF9F1C

// Text colors
colors.text.primary // #1C1C1E (dark mode: #E0E0E0)
colors.text.secondary // #6C757D (dark mode: #AAAAAA)
colors.text.error // #FF3B30

// Background colors
colors.background.primary // #FFFFFF (dark mode: #121212)
colors.background.secondary // #F8F9FA (dark mode: #1E1E1E)
colors.background.card // #FFFFFF (dark mode: #2C2C2E)
```

### Typography

```typescript
// Example usage
import { typography } from '../lib/styles';

// Font sizes
typography.fontSize.xs // 12
typography.fontSize.sm // 14
typography.fontSize.md // 16
typography.fontSize.lg // 18
typography.fontSize.xl // 24

// Font weights
typography.fontWeight.regular // '400'
typography.fontWeight.medium // '500'
typography.fontWeight.semibold // '600'
typography.fontWeight.bold // '700'
```

### Spacing

```typescript
// Example usage
import { spacing } from '../lib/styles';

spacing.xs // 4
spacing.sm // 8
spacing.md // 12
spacing.lg // 16
spacing.xl // 20
spacing.xxl // 24
spacing.xxxl // 32
```

### Border Radius

```typescript
// Example usage
import { borderRadius } from '../lib/styles';

borderRadius.xs // 4
borderRadius.sm // 8
borderRadius.md // 12
borderRadius.lg // 16
borderRadius.xl // 20
borderRadius.round // 9999 (fully rounded)
```

### Shadows

```typescript
// Example usage
import { shadows } from '../lib/styles';

// Light mode shadows
shadows.small // platform-specific shadow values
shadows.medium // platform-specific shadow values 
shadows.large // platform-specific shadow values

// Dark mode shadows (automatically used when in dark mode)
shadows.dark.small // stronger shadows for dark mode
shadows.dark.medium // stronger shadows for dark mode
```

### Layout Helpers

```typescript
// Example usage
import { layouts } from '../lib/styles';

// Common layouts
layouts.container // Basic full-screen container
layouts.section // Section container with card styling
layouts.row // Row with centered items
layouts.center // Centered container
layouts.card // Card container with shadow
```

### Button Styles

```typescript
// Example usage
import { buttons } from '../lib/styles';

// Button styles
buttons.primary // Primary button styles
buttons.primaryText // Text styles for primary button
buttons.secondary // Secondary button styles
buttons.secondaryText // Text styles for secondary button
buttons.danger // Danger/warning button styles
buttons.dangerText // Text styles for danger button
```

### Form Styles

```typescript
// Example usage
import { forms } from '../lib/styles';

// Form element styles
forms.input // Input field styling
forms.inputError // Error state for input
forms.errorText // Error message text styling
forms.label // Form label styling
```

## Using the Theme Hook

The `useTheme` hook provides access to the current theme based on the user's light/dark mode setting:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, typography } from '../lib/styles';

export function MyComponent() {
  // Get theme-aware colors and styles
  const { colors, shadows, isDarkMode } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.background.primary,
        ...shadows.medium 
      }
    ]}>
      <Text style={[
        styles.text,
        { color: colors.text.primary }
      ]}>
        Hello World
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});
```

## Guidelines for Component Styling

1. **Use the Theme System**: Always use the theme constants for colors, spacing, etc.
2. **Dark Mode Compatibility**: Use the `useTheme` hook to get theme-aware colors
3. **Responsive Styling**: Use relative units and flexible layouts
4. **Keep StyleSheet Minimal**: Define only static styles in StyleSheet, use dynamic styles inline
5. **Type Safety**: Use proper TypeScript typing for styles

## Example Component

Here's a complete example of a properly styled component:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, borderRadius, layouts, buttons } from '../lib/styles';

interface CardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export function Card({ title, description, onPress }: CardProps) {
  const { colors, shadows, isDarkMode } = useTheme();
  
  return (
    <Pressable
      style={[
        styles.container,
        { 
          backgroundColor: colors.background.card,
          ...shadows.medium 
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {title}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.icon.secondary} />
      </View>
      
      <Text style={[styles.description, { color: colors.text.secondary }]}>
        {description}
      </Text>
      
      <View style={styles.footer}>
        <Pressable
          style={[buttons.primary]}
          onPress={onPress}
        >
          <Text style={buttons.primaryText}>View Details</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  description: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'flex-end',
  },
});
``` 
