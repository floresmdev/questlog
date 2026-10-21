import { useEffect, useState, type DependencyList } from 'react';

interface ApiState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

interface ApiResult<T> {
  /** The deps this result was fetched for. */
  deps: DependencyList;
  data?: T;
  error?: Error;
}

function sameDeps(a: DependencyList, b: DependencyList): boolean {
  return a.length === b.length && a.every((dep, i) => Object.is(dep, b[i]));
}

/** Runs an api call on mount (and when `deps` change) and tracks its result. */
export function useApi<T>(call: () => Promise<T>, deps: DependencyList = []): ApiState<T> {
  const [result, setResult] = useState<ApiResult<T>>();

  useEffect(() => {
    let cancelled = false;
    call().then(
      (data) => !cancelled && setResult({ deps, data }),
      (error: Error) => !cancelled && setResult({ deps, error }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller
  }, deps);

  // Loading is derived: the last result belongs to older deps (or there is none yet).
  // The previous data stays visible while the new request is in flight.
  return {
    data: result?.data,
    error: result?.error,
    loading: result === undefined || !sameDeps(result.deps, deps),
  };
}
