import type { LucideIcon } from 'lucide-react';

export type TabItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type TabsProps<T extends string> = {
  label: string;
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
};

/** Tab dengan penanda aktif garis bawah emas, sama seperti menu navbar. */
export function Tabs<T extends string>({ label, items, active, onChange }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 overflow-x-auto border-b border-line"
    >
      {items.map(({ id, label: itemLabel, icon: Icon }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={`-mb-px inline-flex h-11 items-center gap-2 whitespace-nowrap border-b-2 px-4 text-sm font-medium transition-colors duration-150 ease-out ${
              selected
                ? 'border-gold-500 text-navy-900'
                : 'border-transparent text-muted hover:text-navy-900'
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {itemLabel}
          </button>
        );
      })}
    </div>
  );
}
