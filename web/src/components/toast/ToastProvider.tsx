import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastTone } from './toast-context.ts';

const TOAST_DURATION_MS = 3000;

type Toast = { id: number; message: string; tone: ToastTone };

const TONE_ICONS = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
} as const;

/** Toast: panel surface bergaris kiri Volt dengan ikon status, hilang otomatis setelah 3 detik (DESIGN.md §5). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {toasts.map((toast) => {
          const Icon = TONE_ICONS[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line border-l-4 border-l-accent bg-surface px-4 py-3 text-sm text-fg shadow-soft"
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 rounded-lg p-1 text-fg/70 hover:text-fg"
                aria-label="Tutup notifikasi"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
