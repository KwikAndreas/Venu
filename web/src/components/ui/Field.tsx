import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { inputClasses } from './styles.ts';

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
};

type ShellProps = FieldProps & { id: string; children: ReactNode };

/** Label selalu di atas input; error tampil di bawah dengan ikon dan dibacakan pembaca layar. */
function FieldShell({ id, label, error, hint, className, children }: ShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="type-label mb-2 block text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-sm text-danger"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function describedBy(id: string, { error, hint }: FieldProps): string | undefined {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export function TextField({
  label,
  error,
  hint,
  className,
  ...input
}: FieldProps & ComponentProps<'input'>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        className={inputClasses(Boolean(error), 'h-11')}
        {...input}
      />
    </FieldShell>
  );
}

export function PasswordField({
  label,
  error,
  hint,
  className,
  ...input
}: FieldProps & Omit<ComponentProps<'input'>, 'type'>) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { label, error, hint })}
          className={inputClasses(Boolean(error), 'h-11 pr-11')}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted hover:text-fg"
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          <Icon className="size-5" aria-hidden />
        </button>
      </div>
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className,
  children,
  ...select
}: FieldProps & ComponentProps<'select'>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        className={inputClasses(Boolean(error), 'h-11 pr-8')}
        {...select}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  ...textarea
}: FieldProps & ComponentProps<'textarea'>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        className={inputClasses(Boolean(error), 'min-h-24 py-2.5')}
        {...textarea}
      />
    </FieldShell>
  );
}
