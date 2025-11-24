import { useRef, useState } from "react";
import "./PhotoUpload.scss";

import { Button } from "@/components/common/Button/Button";
import { supabase } from "@/supabaseClient";

const BUCKET = "wedding-photos";
const MAX_UPLOAD_MB = 5;           // 최종 업로드 목표 용량
const MAX_LONG_SIDE = 1920;        // 긴 변 리사이즈 기준
const JPEG_QUALITY = 0.75;         // 압축 품질(0~1)

export function PhotoUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const onPick = () => fileRef.current?.click();

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있어요.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 자동 압축(필요하면)
      const optimized = await compressIfNeeded(file);

      const ext = optimized.type.includes("png") ? "png" : "jpg";
      const filename =
        `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, optimized, { upsert: false });

      if (error) throw error;

      alert("사진이 업로드되었습니다! 감사합니다 😊");
      e.target.value = "";
    } catch (err) {
      console.error(err);
      alert("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="photo-upload">
      <h2 className="section-title">사진 업로드</h2>
      <p className="photo-upload__desc">
        하객분들이 직접 찍은 사진을 남겨주시면 감사하겠습니다.
        <br />
        (자동으로 최적화되어 업로드됩니다)
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onChangeFile}
        style={{ display: "none" }}
      />

      <Button variant="outline" onClick={onPick} disabled={loading}>
        {loading ? "업로드 중..." : "사진 업로드하기"}
      </Button>
    </section>
  );
}

/* -----------------------------------------------------------
   자동 압축/리사이즈 함수 (라이브러리 X)
----------------------------------------------------------- */
async function compressIfNeeded(file: File): Promise<File> {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB <= MAX_UPLOAD_MB) return file; // 5MB 이하면 그대로

  const img = await loadImage(file);

  // 원본 크기
  let { width, height } = img;

  // 긴 변 기준으로 비율 리사이즈
  const longSide = Math.max(width, height);
  if (longSide > MAX_LONG_SIDE) {
    const scale = MAX_LONG_SIDE / longSide;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  // JPEG로 변환해서 압축
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b!),
      "image/jpeg",
      JPEG_QUALITY
    )
  );

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}
