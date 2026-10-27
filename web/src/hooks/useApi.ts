import { useCallback, useEffect, useState } from 'react';
import { api, toApiError, type ApiError } from '../lib/api.ts';

type Result<T> = {
  key: string | null;
  path: string | null;
  data?: T;
  error?: ApiError;
};

export type ApiState<T> = {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  /** Ambil ulang data (mis. setelah membuat/mengubah sesuatu). */
  reload: () => void;
};

/**
 * Mengambil data GET dari API. `path = null` berarti belum perlu mengambil apa pun.
 * Saat memuat ulang, data lama tetap ditampilkan sampai data baru tiba.
 */
export function useApi<T>(path: string | null): ApiState<T> {
  const [version, setVersion] = useState(0);
  const key = path === null ? null : `${path}#${version}`;
  const [result, setResult] = useState<Result<T>>({ key: null, path: null });

  useEffect(() => {
    if (path === null || key === null) return;
    const controller = new AbortController();
    api.get<T>(path, controller.signal).then(
      (data) => setResult({ key, path, data }),
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, path, error: toApiError(error) });
      },
    );
    return () => controller.abort();
  }, [path, key]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const isCurrent = result.key === key;

  return {
    data: result.path === path ? result.data : undefined,
    error: isCurrent ? result.error : undefined,
    loading: key !== null && !isCurrent,
    reload,
  };
}
