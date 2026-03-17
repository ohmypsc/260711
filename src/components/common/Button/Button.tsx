import { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "basic" | "submit" | "close";
  children: ReactNode;
}

export const Button = ({
  variant = "basic",
  children,
  className = "",
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      className={["w-btn", variant, className].filter(Boolean).join(" ")}
    >
      <span className="w-btn__label">{children}</span>
    </button>
  );
};
