// src/contexts/UsedGroundsContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface UsedGroundsContextType {
    usedGrounds: number[];
    setUsedGrounds: React.Dispatch<React.SetStateAction<number[]>>;
    [Symbol.iterator](): Iterator<number>;
}

const UsedGroundsContext = createContext<UsedGroundsContextType | undefined>(undefined);

export const UsedGroundsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [usedGrounds, setUsedGrounds] = useState<number[]>([]);
    const iterator = function* () {
        for (const ground of usedGrounds) {
            yield ground;
        }
    };    
    return (
        <UsedGroundsContext.Provider value={{ usedGrounds, setUsedGrounds, [Symbol.iterator]: iterator }}>
            {children}
        </UsedGroundsContext.Provider>
    );
};

export function useUsedGrounds() {
    const context = useContext(UsedGroundsContext);
    if (context === undefined) {
        throw new Error('useUsedGrounds must be used within a UsedGroundsProvider');
    }
    return context;
}