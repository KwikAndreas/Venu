import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  return value;
}
