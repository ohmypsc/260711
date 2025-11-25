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
    // ✅ 스크롤 잠금
    scrollYRef.current = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    // ✅ ESC로 닫기
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollYRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), 180); // modalHide와 맞춤
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
          {/* ✅ 전역 버튼 재사용 */}
          <Button variant="soft" onClick={handleClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
