import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button"; // 경로 맞춰주세요
import "./Modal.scss";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  
  // 제목/부제목을 props로 받으면 디자인 통일성이 좋아집니다.
  title?: string;
  subtitle?: string;
  
  anchorRect?: DOMRect | null;
  footer?: React.ReactNode;
  hideFooter?: boolean;
}

export function Modal({
  onClose,
  children,
  title,
  subtitle,
  anchorRect,
  footer,
  hideFooter = false,
}: ModalProps) {
  const scrollYRef = useRef(0);
  const [closing, setClosing] = useState(false);
  const [shiftX, setShiftX] = useState(0);

  // 포탈 타겟 생성
  const portalEl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const existing = document.getElementById("modal-root");
    if (existing) return existing;
    const el = document.createElement("div");
    el.id = "modal-root";
    document.body.appendChild(el);
    return el;
  }, []);

  // 앵커 위치 계산 (옵션)
  useLayoutEffect(() => {
    if (!anchorRect) return;
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const viewportCenterX = window.innerWidth / 2;
    let dx = anchorCenterX - viewportCenterX;
    dx = Math.max(-24, Math.min(24, dx));
    setShiftX(dx);
  }, [anchorRect]);

  // 스크롤 잠금 & ESC 키 처리
  useEffect(() => {
    scrollYRef.current = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

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
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), 200); // 애니메이션 시간과 맞춤
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
          {/* ✅ 헤더 영역 (제목이 있을 때만 렌더링) */}
          {(title || subtitle) && (
            <div className="modal-header">
              {title && <h2 className="modal-title">{title}</h2>}
              {subtitle && <span className="modal-subtitle">{subtitle}</span>}
            </div>
          )}

          {/* 본문 */}
          <div className="modal-content">{children}</div>

          {/* 푸터 */}
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
