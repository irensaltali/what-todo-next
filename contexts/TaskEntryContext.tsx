import React, { createContext, useState, useContext, useCallback } from 'react';

type TaskEntryContextType = {
  isTaskEntryVisible: boolean;
  showTaskEntry: () => void;
  hideTaskEntry: () => void;
  taskVersion: number;
  refreshTasks: () => void;
  onTaskAdded: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
};

export const TaskEntryContext = createContext<TaskEntryContextType>({
  isTaskEntryVisible: false,
  showTaskEntry: () => {},
  hideTaskEntry: () => {},
  taskVersion: 0,
  refreshTasks: () => {},
  onTaskAdded: () => {},
  onTaskUpdated: () => {},
  onTaskDeleted: () => {},
});

export const TaskEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTaskEntryVisible, setIsTaskEntryVisible] = useState(false);
  // taskVersion is incremented whenever tasks change - components can watch this value
  const [taskVersion, setTaskVersion] = useState(0);

  const showTaskEntry = () => {
    setIsTaskEntryVisible(true);
  };

  const hideTaskEntry = () => {
    setIsTaskEntryVisible(false);
  };

  // Increment the task version to trigger subscribers to refresh
  const refreshTasks = useCallback(() => {
    setTaskVersion(prev => prev + 1);
  }, []);

  // Helper methods for specific task operations
  const onTaskAdded = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  const onTaskUpdated = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  const onTaskDeleted = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  return (
    <TaskEntryContext.Provider
      value={{
        isTaskEntryVisible,
        showTaskEntry,
        hideTaskEntry,
        taskVersion,
        refreshTasks,
        onTaskAdded,
        onTaskUpdated,
        onTaskDeleted,
      }}
    >
      {children}
    </TaskEntryContext.Provider>
  );
};

export const useTaskEntry = () => useContext(TaskEntryContext);
