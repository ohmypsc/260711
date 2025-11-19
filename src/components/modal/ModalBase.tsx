import { useEffect, useRef, useState } from "react";
import "./modal.scss";

interface ModalBaseProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalBase({ onClose, children }: ModalBaseProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // === 스크롤 락 ===
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(), 220);
  };

  return (
    <div className="modal-overlay">
      <div
        ref={modalRef}
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // 내부 클릭만 허용
        style={{
          animation: closing ? "modalHide 0.22s ease forwards" : undefined,
        }}
      >
        {children}

        <button className="modal-close-btn" onClick={handleClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
