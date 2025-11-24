import { useRef, useState } from "react";
import "./PhotoUpload.scss";

import { Button } from "@/components/common/Button/Button";
import { supabase } from "@/supabaseClient";

const BUCKET = "wedding-photos";
const MAX_UPLOAD_MB = 5;      // 최종 업로드 목표 용량
const MAX_LONG_SIDE = 1920;   // 긴 변 리사이즈
const JPEG_QUALITY = 0.75;    // JPEG 품질(0~1)

export function PhotoUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const onPick = () => fileRef.current?.click();

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setLoading(true);
    setProgress({ done: 0, total: files.length });

    try {
      let done = 0;

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          // 이미지가 아닌 건 건너뛰기
          done++;
          setProgress({ done, total: files.length });
          continue;
        }

        // ✅ 자동 압축(필요 시)
        const optimized = await compressIfNeeded(file);

        const ext = optimized.type.includes("png") ? "png" : "jpg";
        const filename =
          `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(filename, optimized, { upsert: false });

        if (error) throw error;

        done++;
        setProgress({ done, total: files.length });
      }

      alert("사진이 업로드되었습니다! 감사합니다 😊");
      e.target.value = "";
    } catch (err) {
      console.error(err);
      alert("업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <section className="photo-upload">
      <h2 className="section-title">사진 업로드</h2>
      <p className="photo-upload__desc">
        하객분들이 직접 찍은 사진을 남겨주시면 감사하겠습니다.
        <br />
        여러 장을 한 번에 선택해도 자동으로 최적화되어 업로드됩니다.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple              // ✅ 여러 장 선택
        onChange={onChangeFile}
        style={{ display: "none" }}
      />

      <Button variant="outline" onClick={onPick} disabled={loading}>
        {loading
          ? progress
            ? `업로드 중... (${progress.done}/${progress.total})`
            : "업로드 중..."
          : "사진 여러 장 업로드하기"}
      </Button>
    </section>
  );
}

/* -----------------------------------------------------------
   자동 압축/리사이즈 (라이브러리 X)
----------------------------------------------------------- */
async function compressIfNeeded(file: File): Promise<File> {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB <= MAX_UPLOAD_MB) return file; // 5MB 이하면 그대로

  const img = await loadImage(file);

  let { width, height } = img;

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
