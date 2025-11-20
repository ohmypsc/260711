

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
    /* 🔒 스크롤 락 */
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(), 240);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        ref={modalRef}
        className={`modal-container ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">{children}</div>

        <button className="modal-close-btn" onClick={handleClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
