import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import "./Modal.scss";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ onClose, children }: ModalProps) {
  const scrollYRef = useRef(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // ✅ 현재 스크롤 위치 저장
    scrollYRef.current = window.scrollY;

    // ✅ 스크롤바 폭 계산 (데스크톱에서만 값이 생김)
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // ✅ 스크롤 잠금
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    // ✅ 스크롤바가 실제로 있는 경우에만 패딩 보정
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // ✅ ESC로 닫기
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      // ✅ 원복
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";

      window.scrollTo(0, scrollYRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), 180); // modalHide 애니메이션 시간과 맞춤
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className={`modal-container ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-content">{children}</div>

        <div className="modal-footer">
          <Button variant="close" onClick={handleClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
