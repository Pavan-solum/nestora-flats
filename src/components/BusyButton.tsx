"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingLabel: string;
  children: ReactNode;
};

export function BusyButton({
  pending = false,
  pendingLabel,
  children,
  className,
  disabled,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      className={className}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending && <span className="btn-spinner" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
