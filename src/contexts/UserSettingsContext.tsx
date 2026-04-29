import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ensureDeviceId, getSavedAllergens, replaceSavedAllergens } from '../lib/db';
import type { Allergen } from '../types';

interface UserSettingsContextValue {
  selectedAllergens: Allergen[];
  isLoading: boolean;
  toggleAllergen: (allergen: Allergen) => void;
  clearAllergens: () => void;
}

const UserSettingsContext = createContext<UserSettingsContextValue>({
  selectedAllergens: [],
  isLoading: true,
  toggleAllergen: () => {},
  clearAllergens: () => {},
});

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      await ensureDeviceId(db);
      const savedAllergens = await getSavedAllergens(db);

      if (mounted) {
        setSelectedAllergens(savedAllergens);
        setIsLoading(false);
      }
    }

    loadSettings().catch(() => {
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [db]);

  const toggleAllergen = (allergen: Allergen) => {
    setSelectedAllergens((current) => {
      const exists = current.some((entry) => entry.id === allergen.id);
      const nextAllergens = exists
        ? current.filter((entry) => entry.id !== allergen.id)
        : [...current, allergen].sort((left, right) => left.name.localeCompare(right.name, 'fr'));

      replaceSavedAllergens(db, nextAllergens).catch(() => {});
      return nextAllergens;
    });
  };

  const clearAllergens = () => {
    setSelectedAllergens([]);
    replaceSavedAllergens(db, []).catch(() => {});
  };

  return (
    <UserSettingsContext.Provider
      value={{
        selectedAllergens,
        isLoading,
        toggleAllergen,
        clearAllergens,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  return useContext(UserSettingsContext);
}
