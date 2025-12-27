import { createContext, useContext, useState } from "react";

const ElectionContext = createContext(null);

export function ElectionProvider({ children }) {
  const [activeElectionId, setActiveElectionId] = useState(null);

  return (
    <ElectionContext.Provider
      value={{
        activeElectionId,
        setActiveElectionId,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
}

export function useElectionContext() {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error(
      "useElectionContext must be used within an ElectionProvider"
    );
  }
  return context;
}
