# Style System Refactoring

This document summarizes the changes made to organize and centralize styles in the ToDoNext app.

## Summary of Changes

1. **Created a centralized theme system:**
   - Created `lib/styles/theme.ts` with common style definitions
   - Created `lib/styles/useTheme.ts` for theme-aware styling with dark mode support
   - Created `lib/styles/index.ts` for easy imports

2. **Defined reusable style constants:**
   - Colors (with dark mode variants)
   - Typography (font sizes, weights, line heights)
   - Spacing
   - Border radius
   - Shadows (platform-specific with dark mode variants)
   - Layout helpers
   - Button styles
   - Form styles

3. **Updated components to use the new style system:**
   - Refactored `StatusBar.tsx` to use theme
   - Refactored `DatePicker.tsx` to use theme
   - Removed duplicated style definitions

4. **Added documentation:**
   - Created `docs/THEMING.md` with detailed usage instructions
   - Added examples and best practices

## Benefits

1. **Consistency**: All components now use the same style constants
2. **Dark Mode Support**: Automatic handling of light/dark mode styling
3. **Maintainability**: Style changes can be made in one place
4. **Type Safety**: Added proper TypeScript typing for the theme system
5. **Developer Experience**: Simplified styling with clear documentation

## Files Created/Modified

**Created:**
- `lib/styles/theme.ts`
- `lib/styles/useTheme.ts`
- `lib/styles/index.ts`
- `docs/THEMING.md`
- `docs/REFACTORING.md`

**Modified:**
- `components/StatusBar.tsx`
- `components/DatePicker.tsx`

## Next Steps

To complete the style system refactoring, the following steps should be taken:

1. Refactor remaining components to use the theme system
2. Add support for additional themes if needed
3. Consider adding responsive design utilities
4. Add unit tests for theme functionality

## How to Use the New Style System

Refer to `docs/THEMING.md` for detailed usage instructions and examples.

Simple usage example:

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, typography, borderRadius } from '../lib/styles';

function MyComponent() {
  const { colors, shadows } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.background.card,
        ...shadows.medium 
      }
    ]}>
      <Text style={[styles.text, { color: colors.text.primary }]}>
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
    fontWeight: '600',
  },
});
``` 
