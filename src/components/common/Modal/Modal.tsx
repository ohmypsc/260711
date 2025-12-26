import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/common/Button/Button";
import "./Modal.scss";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  anchorRect?: DOMRect | null;

  /** ✅ 커스텀 footer (넘기면 기본 닫기 대신 이것을 렌더) */
  footer?: React.ReactNode;

  /** ✅ footer 자체를 숨기고 싶을 때 */
  hideFooter?: boolean;
}

export function Modal({
  onClose,
  children,
  anchorRect,
  footer,
  hideFooter = false,
}: ModalProps) {
  const scrollYRef = useRef(0);
  const [closing, setClosing] = useState(false);
  const [shiftX, setShiftX] = useState(0);

  const portalEl = useMemo(() => {
    if (typeof window === "undefined") return null;

    const existing = document.getElementById("modal-root");
    if (existing) return existing;

    const el = document.createElement("div");
    el.id = "modal-root";
    document.body.appendChild(el);
    return el;
  }, []);

  useLayoutEffect(() => {
    if (!anchorRect) return;

    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const viewportCenterX = window.innerWidth / 2;

    let dx = anchorCenterX - viewportCenterX;
    dx = Math.max(-24, Math.min(24, dx));

    setShiftX(dx);
  }, [anchorRect]);

  useEffect(() => {
    scrollYRef.current = window.scrollY;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

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
      document.body.style.paddingRight = "";

      window.scrollTo(0, scrollYRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), 180);
  };

  if (!portalEl) return null;

  const modalUI = (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-positioner"
        style={{ transform: `translateX(${shiftX}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`modal-container ${closing ? "closing" : ""}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content">{children}</div>

          {!hideFooter && (
            <div className="modal-footer">
              {footer ?? (
                <Button variant="close" onClick={handleClose}>
                  닫기
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalUI, portalEl);
}
