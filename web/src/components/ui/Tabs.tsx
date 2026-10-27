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

/** Tab kapital condensed dengan bar Volt 3px sebagai penanda aktif, sama seperti navbar. */
export function Tabs<T extends string>({ label, items, active, onChange }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-6 overflow-x-auto border-b border-line"
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
            className={`-mb-px inline-flex h-12 items-center gap-2 whitespace-nowrap border-b-[3px] font-display text-base font-bold uppercase tracking-[0.04em] transition-colors duration-150 ease-out ${
              selected ? 'border-volt text-fg' : 'border-transparent text-muted hover:text-fg'
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
