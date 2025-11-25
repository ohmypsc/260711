import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

  // ✅ 버튼 축 vs 뷰포트 축 차이 계산 → 모달 X 보정
  useLayoutEffect(() => {
    if (!anchorRect) return;

    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const viewportCenterX = window.innerWidth / 2;

    // 버튼 중심이 뷰포트 중심보다 오른쪽이면 +, 왼쪽이면 -
    let dx = anchorCenterX - viewportCenterX;

    // ✅ 과한 이동 방지 (최대 24px 정도만 보정)
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

  return (
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
}
