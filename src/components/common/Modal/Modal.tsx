import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/common/Button/Button";
import "./Modal.scss";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  anchorRect?: DOMRect | null; // ✅ 버튼 위치
}

export function Modal({ onClose, children, anchorRect }: ModalProps) {
  const scrollYRef = useRef(0);
  const [closing, setClosing] = useState(false);
  const [shiftX, setShiftX] = useState(0);

  // ✅ Portal mount node (SSR 안전 처리)
  const portalEl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const el = document.createElement("div");
    el.id = "modal-root";
    return el;
  }, []);

  // ✅ body에 portal node 붙이기/떼기
  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      document.body.removeChild(portalEl);
    };
  }, [portalEl]);

  // ✅ 버튼 축 vs 뷰포트 축 차이 계산 → 모달 X 보정
  useLayoutEffect(() => {
    if (!anchorRect) return;

    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const viewportCenterX = window.innerWidth / 2;

    let dx = anchorCenterX - viewportCenterX;
    dx = Math.max(-24, Math.min(24, dx));

    setShiftX(dx);
  }, [anchorRect]);

  useEffect(() => {
    // ✅ 현재 스크롤 위치 저장
    scrollYRef.current = window.scrollY;

    // ✅ 스크롤바 폭 계산 (데스크톱용 흔들림 방지)
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // ✅ 스크롤 잠금
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

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

  // ✅ portalEl 준비 안 됐으면 렌더 X
  if (!portalEl) return null;

  // ✅ 실제 모달 UI
  const modalUI = (
    <div className="modal-overlay" onClick={handleClose}>
      {/* ✅ 포지셔너 wrapper: 얘만 X 보정 */}
      <div
        className="modal-positioner"
        style={{ transform: `translateX(${shiftX}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ 기존 모달 애니메이션/스타일은 그대로 */}
        <div
          className={`modal-container ${closing ? "closing" : ""}`}
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
    </div>
  );

  // ✅ body 기준으로 띄우기
  return createPortal(modalUI, portalEl);
}
