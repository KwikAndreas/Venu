import type { ConfirmOptions } from './dialog';

/** Alert React Native tidak berfungsi di web, jadi pratinjau web memakai dialog browser. */
export async function confirmAction({ title, message }: ConfirmOptions): Promise<boolean> {
  return window.confirm(`${title}\n\n${message}`);
}

export function notify(title: string, message: string): void {
  window.alert(`${title}\n\n${message}`);
}
