import { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 
   * solid  : 메인 CTA (가장 고급/깔끔)
   * soft   : 서브 액션 (은은한 포인트)
   * outline: 선택/토글 (가벼운 라인)
   */
  variant?: "solid" | "soft" | "outline";
  children: ReactNode;
}

export const Button = ({
  variant = "solid",
  children,
  className = "",
  ...rest
}: ButtonProps) => {
  return (
    <button {...rest} className={`w-btn ${variant} ${className}`}>
      {children}
    </button>
  );
};
