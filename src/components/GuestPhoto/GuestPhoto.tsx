import "./GuestPhoto.scss";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import imageCompression from "browser-image-compression";

type ToastState = { msg: string; type: "success" | "error" } | null;

export function GuestPhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 구글 앱스 스크립트 웹앱 URL (입력하신 주소 그대로 유지)
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
    // 1. 선택된 파일들을 안전한 배열(Array) 형태로 변환합니다.
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    setIsUploading(true);
    // 2. 여러 장을 올릴 땐 시간이 걸리므로 하객이 기다릴 수 있게 안내 문구 변경
    setToast({ msg: `${files.length}장의 사진을 안전하게 전송 중입니다... (조금 걸려요!)`, type: "success" });

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 이미지 압축
        const compressedFile = await imageCompression(file, options);

        // Base64 변환
        const base64data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            resolve((reader.result as string).split(",")[1]);
          };
        });

        // 구글 스크립트로 전송
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

        // ⭐️ 핵심 해결책: 구글 서버가 튕겨내지 않게 다음 사진을 보내기 전 1.5초(1500ms) 휴식
        if (i < files.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      setToast({ msg: "모든 사진이 성공적으로 전달되었습니다!", type: "success" });

    } catch (error) {
      console.error(error);
      setToast({ msg: "일부 사진 전송에 실패했습니다. 다시 시도해 주세요.", type: "error" });
    } finally {
      setIsUploading(false);
      // 똑같은 사진을 다시 올릴 수도 있으니 input 초기화
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

        {/* multiple 속성으로 여러 장 선택 가능 */}
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* 토스트 알림창 */}
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
