import { useState, useCallback } from "react";
import { handleApiError, ApiError } from "../utils/apiUtils";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

// Custom hook for API calls with loading and error states
export const useApi = <T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const apiError = handleApiError(error);
        setState({ data: null, loading: false, error: apiError });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
};

// Hook for API calls that don't need to store data (like delete operations)
export const useApiAction = (apiFunction: (...args: any[]) => Promise<any>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await apiFunction(...args);
        setLoading(false);
        return true;
      } catch (error) {
        const apiError = handleApiError(error);
        setError(apiError);
        setLoading(false);
        return false;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};

// Hook for paginated API calls
export const usePaginatedApi = <T>(
  apiFunction: (
    page: number,
    limit: number,
    ...args: any[]
  ) => Promise<{ data: T[]; total: number; page: number; limit: number }>
) => {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as ApiError | null,
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  });

  const loadPage = useCallback(
    async (page: number, limit: number, ...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(page, limit, ...args);
        setState((prev) => ({
          ...prev,
          data: page === 1 ? result.data : [...prev.data, ...result.data],
          loading: false,
          page: result.page,
          limit: result.limit,
          total: result.total,
          hasMore: result.data.length === limit,
        }));
      } catch (error) {
        const apiError = handleApiError(error);
        setState((prev) => ({ ...prev, loading: false, error: apiError }));
      }
    },
    [apiFunction]
  );

  const loadMore = useCallback(
    (...args: any[]) => {
      if (!state.loading && state.hasMore) {
        loadPage(state.page + 1, state.limit, ...args);
      }
    },
    [loadPage, state.loading, state.hasMore, state.page, state.limit]
  );

  const refresh = useCallback(
    (...args: any[]) => {
      loadPage(1, state.limit, ...args);
    },
    [loadPage, state.limit]
  );

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      page: 1,
      limit: 10,
      total: 0,
      hasMore: true,
    });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    page: state.page,
    total: state.total,
    hasMore: state.hasMore,
    loadPage,
    loadMore,
    refresh,
    reset,
  };
};
