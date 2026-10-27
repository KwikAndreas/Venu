import type { LucideIcon } from 'lucide-react';

export type TabItem<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type TabsProps<T extends string> = {
  label: string;
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
};

/** Segmen berbentuk pil: wadah surface, tab aktif terangkat (sama dengan pilihan olahraga). */
export function Tabs<T extends string>({ label, items, active, onChange }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1"
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
            className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition duration-150 ease-out ${
              selected ? 'bg-raised text-fg shadow-soft' : 'text-muted hover:text-fg'
            }`}
          >
            {Icon && <Icon className="size-4" aria-hidden />}
            {itemLabel}
          </button>
        );
      })}
    </div>
  );
}
