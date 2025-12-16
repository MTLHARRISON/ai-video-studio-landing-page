import React, { createContext, useContext, useState, ReactNode } from 'react';

type TrackSelectionContextType = {
  selectedRound: number | null;
  setSelectedRound: (round: number | null) => void;
};

const TrackSelectionContext = createContext<TrackSelectionContextType | undefined>(undefined);

export function TrackSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  return (
    <TrackSelectionContext.Provider value={{ selectedRound, setSelectedRound }}>
      {children}
    </TrackSelectionContext.Provider>
  );
}

export function useTrackSelection() {
  const ctx = useContext(TrackSelectionContext);
  if (!ctx) throw new Error('useTrackSelection must be used within TrackSelectionProvider');
  return ctx;
}
