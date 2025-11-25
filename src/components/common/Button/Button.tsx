import { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * basic  : 커버 메인 '입장' 버튼 (가장 예쁘고 주인공)
   * submit : 모달 안 '제출/확인' 버튼
   * close  : 모달 안 '닫기/취소' 버튼
   */
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
    <button {...rest} className={`w-btn ${variant} ${className}`}>
      {children}
    </button>
  );
};
