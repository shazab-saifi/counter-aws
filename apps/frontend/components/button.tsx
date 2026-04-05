import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50";

  const variantClasses = {
    primary: "bg-gray-200 text-gray-950 hover:bg-gray-100",
    secondary: "border border-yellow-400/40 bg-yellow-400/10 text-yellow-100 hover:bg-yellow-400/20",
    danger: "border border-yellow-500/45 bg-yellow-500/15 text-yellow-50 hover:bg-yellow-500/25",
    ghost: "border border-gray-500/40 bg-transparent text-gray-200 hover:bg-gray-800/70",
  };

  const sizeClasses = {
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-3.5 text-sm",
  };

  return joinClasses(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function Button({
  children,
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
