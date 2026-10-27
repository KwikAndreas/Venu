import { useCallback, useEffect, useState } from 'react';
import { api, toApiError, type ApiError } from '../lib/api.ts';

type Result<T> = {
  key: string | null;
  source: string | null;
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
 * `scope` membedakan data dengan path sama milik konteks berbeda (mis. id user yang login),
 * sehingga data user lama tidak pernah ditampilkan untuk user baru.
 * Saat memuat ulang, data lama tetap ditampilkan sampai data baru tiba.
 */
export function useApi<T>(path: string | null, scope = ''): ApiState<T> {
  const [version, setVersion] = useState(0);
  const source = path === null ? null : `${scope}|${path}`;
  const key = source === null ? null : `${source}#${version}`;
  const [result, setResult] = useState<Result<T>>({ key: null, source: null });

  useEffect(() => {
    if (path === null || key === null) return;
    const controller = new AbortController();
    api.get<T>(path, controller.signal).then(
      (data) => setResult({ key, source, data }),
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, source, error: toApiError(error) });
      },
    );
    return () => controller.abort();
  }, [path, source, key]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const isCurrent = result.key === key;

  return {
    data: result.source === source ? result.data : undefined,
    error: isCurrent ? result.error : undefined,
    loading: key !== null && !isCurrent,
    reload,
  };
}
