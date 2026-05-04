import React, { createContext, useContext, useState, useEffect } from 'react';
import { Jurisdiction, CountryCode } from '../types';
import { JURISDICTIONS } from '../constants';

interface JurisdictionContextType {
  selectedJurisdiction: Jurisdiction;
  setJurisdiction: (code: CountryCode) => void;
  availableJurisdictions: Jurisdiction[];
}

const JurisdictionContext = createContext<JurisdictionContextType | undefined>(undefined);

export const JurisdictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Kuwait
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>(
    JURISDICTIONS.find(j => j.code === 'KW') || JURISDICTIONS[0]
  );

  const setJurisdiction = (code: CountryCode) => {
    const found = JURISDICTIONS.find(j => j.code === code);
    if (found) {
      setSelectedJurisdiction(found);
      localStorage.setItem('selectedJurisdiction', code);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('selectedJurisdiction') as CountryCode;
    if (saved) {
      const found = JURISDICTIONS.find(j => j.code === saved);
      if (found) setSelectedJurisdiction(found);
    }
  }, []);

  return (
    <JurisdictionContext.Provider value={{ selectedJurisdiction, setJurisdiction, availableJurisdictions: JURISDICTIONS }}>
      {children}
    </JurisdictionContext.Provider>
  );
};

export const useJurisdiction = () => {
  const context = useContext(JurisdictionContext);
  if (context === undefined) {
    throw new Error('useJurisdiction must be used within a JurisdictionProvider');
  }
  return context;
};
