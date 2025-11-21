import { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "ghost";
  children: ReactNode;
}

export const Button = ({
  variant = "outline",
  children,
  className = "",
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      className={`w-btn ${variant} ${className}`}
    >
      {children}
    </button>
  );
};
