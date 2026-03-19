import "./GuestPhoto.scss";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import imageCompression from "browser-image-compression";

type ToastState = { msg: string; type: "success" | "error" } | null;

export function GuestPhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 아까 발급받은 '웹앱 URL'을 여기에 꼭 넣어주세요!
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg4odMjPLuzNEom31MycfQZl33VzzEgpcRnzQS_yYifnFXd-ReHqCrxhQtTon77DX_/exec";

  // 토스트 타이머 (Account와 동일)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // 용량이 큰 사진일 수 있으니 중간 알림을 하나 띄워줍니다.
    setToast({ msg: "사진을 최적화하여 전송 중입니다...", type: "success" });

    try {
      // 1. 이미지 압축 (최대 1MB, 해상도 1920px 이하로 깎아줍니다)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // 2. 구글 전송을 위한 Base64 변환
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(",")[1];

        // 3. 구글 앱스 스크립트로 쏘기
        const response = await fetch(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            base64: base64data,
            fileName: file.name,
            mimeType: compressedFile.type,
          }),
        });

        const result = await response.json();

        if (result.status === "success") {
          setToast({ msg: "소중한 사진이 성공적으로 전달되었습니다!", type: "success" });
        } else {
          throw new Error("서버 에러");
        }
      };
    } catch (error) {
      console.error(error);
      setToast({ msg: "사진 전송에 실패했습니다. 다시 시도해 주세요.", type: "error" });
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

        {/* 실제 작동하는 숨겨진 input */}
        <input
          type="file"
          accept="image/*"
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
