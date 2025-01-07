// src/contexts/LastMatchesContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface LastMatchesContextType {
    lastMatches: number[][];
    setLastMatches: React.Dispatch<React.SetStateAction<number[][]>>;
}

const LastMatchesContext = createContext<LastMatchesContextType | undefined>(undefined);

export const LastMatchesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lastMatches, setLastMatches] = useState<number[][]>([]);
    return (
        <LastMatchesContext.Provider value={{ lastMatches, setLastMatches }}>
            {children}
        </LastMatchesContext.Provider>
											   
    );
};

export function useLastMatches() {
    const context = useContext(LastMatchesContext);
    if (context === undefined) {
        throw new Error('useLastMatches must be used within a LastMatchesProvider');
    }
    return context;
}