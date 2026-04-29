import { useEffect, useState } from 'react';
import { fetchAllergens } from '../../../services/menu.service';
import type { Allergen } from '../../../types';

export function useAllergenOptions() {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAllergens() {
      try {
        const nextAllergens = await fetchAllergens();
        if (mounted) {
          setAllergens(nextAllergens);
          setError(null);
        }
      } catch {
        if (mounted) {
          setError("Impossible de charger la liste des allergènes.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAllergens();

    return () => {
      mounted = false;
    };
  }, []);

  return { allergens, isLoading, error };
}
