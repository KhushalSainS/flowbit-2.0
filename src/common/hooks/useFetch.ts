import { useState, useEffect } from 'react';

interface UseFetchOptions {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  immediate?: boolean;
}

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type UseFetchReturn<T> = UseFetchState<T> & {
  refetch: () => Promise<void>;
};

export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = { immediate: true }
): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: options.immediate === false ? false : true,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(url, {
        headers: options.headers,
        credentials: options.credentials || 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  };

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, [url]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export default useFetch;
