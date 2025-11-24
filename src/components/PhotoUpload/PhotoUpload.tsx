import { useEffect, useRef, useState } from "react";
import "./PhotoUpload.scss";

import { Button } from "@/components/common/Button/Button";
import { supabase } from "@/supabaseClient";

const BUCKET = "wedding-photos";
const MAX_UPLOAD_MB = 5;
const MAX_LONG_SIDE = 1920;
const JPEG_QUALITY = 0.75;

const THUMBS_PER_PAGE = 24;

type PhotoThumb = {
  name: string;
  url: string;
  created_at: string;
};

export function PhotoUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] =
    useState<{ done: number; total: number } | null>(null);

  const [thumbs, setThumbs] = useState<PhotoThumb[]>([]);
  const [thumbLoading, setThumbLoading] = useState(true);

  // ✅ 페이지네이션 state
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const onPick = () => fileRef.current?.click();

  // ✅ 버킷에서 페이지 단위로 사진 가져오기
  const loadThumbs = async (targetPage = page) => {
    setThumbLoading(true);
    try {
      const offset = targetPage * THUMBS_PER_PAGE;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list("", {
          limit: THUMBS_PER_PAGE,
          offset, // ✅ 페이지 오프셋
          sortBy: { column: "created_at", order: "desc" },
        } as any); // Supabase 타입에서 offset 없다고 뜨면 any로 무시

      if (error) throw error;

      const list = (data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => {
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(f.name);

          return {
            name: f.name,
            url: urlData.publicUrl,
            created_at: f.created_at ?? "",
          };
        });

      setThumbs(list);
      setPage(targetPage);

      // ✅ 다음 페이지 존재 여부(현재 페이지가 꽉 찼으면 다음이 있다고 간주)
      setHasNext(list.length === THUMBS_PER_PAGE);
    } catch (e) {
      console.error(e);
    } finally {
      setThumbLoading(false);
    }
  };

  useEffect(() => {
    loadThumbs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setLoading(true);
    setProgress({ done: 0, total: files.length });

    const failed: string[] = [];
    let done = 0;

    for (const file of files) {
      try {
        if (!file.type.startsWith("image/")) {
          failed.push(`${file.name} (이미지 아님)`);
          continue;
        }

        const optimized = await compressIfNeeded(file);

        const ext = optimized.type.includes("png") ? "png" : "jpg";
        const filename = `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(filename, optimized, { upsert: false });

        if (error) throw error;
      } catch (err: any) {
        console.error("Upload failed:", file.name, err);
        failed.push(`${file.name} (${err?.message ?? "알 수 없는 오류"})`);
      } finally {
        done++;
        setProgress({ done, total: files.length });
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    setLoading(false);
    setProgress(null);
    e.target.value = "";

    // ✅ 업로드 후 "첫 페이지" 다시 로드
    loadThumbs(0);

    if (failed.length === 0) {
      alert("사진이 모두 업로드되었습니다! 감사합니다 😊");
    } else {
      alert(
        `일부 사진 업로드가 실패했어요.\n\n${failed.join("\n")}\n\n` +
          `다시 시도하거나 JPG로 변환 후 올려주세요.`
      );
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
        multiple
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

      {/* ✅ 썸네일 갤러리 */}
      <div className="thumbs">
        <div className="thumbs__title">최근 업로드된 사진</div>

        {thumbLoading ? (
          <div className="thumbs__loading">불러오는 중…</div>
        ) : thumbs.length === 0 ? (
          <div className="thumbs__empty">아직 업로드된 사진이 없습니다.</div>
        ) : (
          <>
            <div className="thumbs__grid">
              {thumbs.map((t) => (
                <a
                  key={t.name}
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="thumb"
                  title={t.name}
                >
                  <img src={t.url} alt="uploaded" loading="lazy" />
                </a>
              ))}
            </div>

            {/* ✅ 페이지네이션 */}
            <div className="thumbs__pagination">
              <button
                className="page-btn"
                disabled={page === 0 || thumbLoading}
                onClick={() => loadThumbs(page - 1)}
              >
                이전
              </button>

              <div className="page-info">{page + 1} 페이지</div>

              <button
                className="page-btn"
                disabled={!hasNext || thumbLoading}
                onClick={() => loadThumbs(page + 1)}
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* -----------------------------------------------------------
   자동 압축/리사이즈
----------------------------------------------------------- */
async function compressIfNeeded(file: File): Promise<File> {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB <= MAX_UPLOAD_MB) return file;

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

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("이미지 변환 실패"))),
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
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 로드 실패"));
    };
    img.src = url;
  });
}
