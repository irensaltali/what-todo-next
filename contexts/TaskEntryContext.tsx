import React, { createContext, useState, useContext } from 'react';

type TaskEntryContextType = {
  isTaskEntryVisible: boolean;
  showTaskEntry: () => void;
  hideTaskEntry: () => void;
};

export const TaskEntryContext = createContext<TaskEntryContextType>({
  isTaskEntryVisible: false,
  showTaskEntry: () => {},
  hideTaskEntry: () => {},
});

export const TaskEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTaskEntryVisible, setIsTaskEntryVisible] = useState(false);

  const showTaskEntry = () => {
    setIsTaskEntryVisible(true);
  };

  const hideTaskEntry = () => {
    setIsTaskEntryVisible(false);
  };

  return (
    <TaskEntryContext.Provider
      value={{
        isTaskEntryVisible,
        showTaskEntry,
        hideTaskEntry,
      }}
    >
      {children}
    </TaskEntryContext.Provider>
  );
};

export const useTaskEntry = () => useContext(TaskEntryContext);
