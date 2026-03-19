import "./GuestPhoto.scss";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import imageCompression from "browser-image-compression";

type ToastState = { msg: string; type: "success" | "error" } | null;

export function GuestPhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 구글 앱스 스크립트 웹앱 URL (유지)
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg4odMjPLuzNEom31MycfQZl33VzzEgpcRnzQS_yYifnFXd-ReHqCrxhQtTon77DX_/exec";

  // 토스트 타이머
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. 선택된 '모든' 파일을 가져옵니다.
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    // 선택된 사진 장수를 포함해서 알림 띄우기
    setToast({ msg: `${files.length}장의 사진을 최적화하여 전송 중입니다...`, type: "success" });

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      // 2. 선택한 사진 개수만큼 반복해서 하나씩 구글로 보냅니다.
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 이미지 압축
        const compressedFile = await imageCompression(file, options);

        // 구글 전송을 위한 Base64 변환 (여러 장을 처리하기 위해 Promise로 감쌉니다)
        const base64data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            resolve((reader.result as string).split(",")[1]);
          };
        });

        // 구글 앱스 스크립트로 쏘기
        const response = await fetch(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            base64: base64data,
            fileName: file.name,
            mimeType: compressedFile.type,
          }),
        });

        const result = await response.json();

        if (result.status !== "success") {
          throw new Error(`서버 에러: ${file.name} 업로드 실패`);
        }
      }

      // 반복문이 에러 없이 무사히 끝나면 완료 메시지 띄우기
      setToast({ msg: "모든 사진이 성공적으로 전달되었습니다!", type: "success" });

    } catch (error) {
      console.error(error);
      setToast({ msg: "일부 사진 전송에 실패했습니다. 다시 시도해 주세요.", type: "error" });
    } finally {
      setIsUploading(false);
      // input 초기화
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="guest-photo-wrapper">
      <h2 className="section-title">사진 공유하기</h2>

      <div className="section-desc">
        <p>신랑 신부의 가장 아름다운 순간을</p>
        <p>사진으로 남겨 공유해 주세요.</p>
      </div>

      <div className="photo-card">
        <div className="photo-card__top">
          <span className="chip">Gallery</span>
        </div>

        <div className="photo-card__bottom">
          <p className="desc">
            하객분들이 찍어주신 사진은<br />
            저희에게 큰 선물이 됩니다.
          </p>

          <button
            type="button"
            className="action-btn"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? "전송 중..." : "사진 선택하기"}
          </button>
        </div>

        {/* 👇 multiple 속성이 추가된 실제 input */}
        <input
          type="file"
          accept="image/*"
          multiple // 여러 장 선택 기능 활성화
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Account와 완벽히 동일한 구조의 토스트 */}
      {toast &&
        createPortal(
          <div className="custom-toast">
            <i
              className={
                toast.type === "success"
                  ? "fa-solid fa-check"
                  : "fa-solid fa-circle-exclamation"
              }
            ></i>
            {toast.msg}
          </div>,
          document.body
        )}
    </div>
  );
}
