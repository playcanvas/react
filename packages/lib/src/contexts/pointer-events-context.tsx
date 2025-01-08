import { createContext, useContext } from "react";

export const PointerEventsContext = createContext<Set<string> | null>(null);

export const usePointerEventsContext = () => {
  const context = useContext(PointerEventsContext);
  if (context === null) {
    throw new Error('usePointerEventsContext must be used within a PointerEventsContext.Provider');
  }
  return context;
};