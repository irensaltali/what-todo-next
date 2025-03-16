// Export all style related utilities
export * from './theme';
export * from './useTheme';
export * from './auth';
export * from './layout';
export * from './content';
export * from './home';
export * from './profile';
export * from './task-list';
export * from './date-picker';
export * from './featured-task-card';
export * from './focus-task-view';
export * from './image-editor';
export * from './status-bar';
export * from './task-entry-bottom-sheet';

// Utility function to create dynamic styles based on theme
export const createStyles = (stylesFn: (theme: ReturnType<typeof import('./useTheme').useTheme>) => any) => {
  return () => {
    const theme = import('./useTheme').then(module => module.useTheme());
    return stylesFn(theme as any);
  };
}; 
