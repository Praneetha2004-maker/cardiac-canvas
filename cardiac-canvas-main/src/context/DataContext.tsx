import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ParsedData } from '@/lib/csvParser';

interface DataContextType {
  data: ParsedData | null;
  setData: (data: ParsedData | null) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ParsedData | null>(null);
  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
