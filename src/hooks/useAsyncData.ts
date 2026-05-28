import { useEffect, useState, type DependencyList } from 'react';

/**
 * Runs an async `loader` on mount and whenever `deps` change, tracking loading
 * and error state and guarding against updates after unmount. `setData` is
 * exposed for optimistic/local updates between loads.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList,
  initialData: T,
  errorMessage: string
) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const nextData = await loader();
        if (mounted) {
          setData(nextData);
          setError(null);
        }
      } catch (loadError: unknown) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : errorMessage);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error };
}
