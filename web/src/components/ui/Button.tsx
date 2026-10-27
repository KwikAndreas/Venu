import { LoaderCircle } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Link, type LinkProps } from 'react-router';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './styles.ts';

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize };

type ButtonProps = ComponentProps<'button'> & StyleProps & { loading?: boolean };

export function Button({
  variant,
  size,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, ...rest }: LinkProps & StyleProps) {
  return <Link className={buttonClasses(variant, size, className)} {...rest} />;
}
