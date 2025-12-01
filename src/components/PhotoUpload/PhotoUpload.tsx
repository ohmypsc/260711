import { useEffect, useRef, useState } from "react";
import "./PhotoUpload.scss";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

const BUCKET = "wedding-photos";
const MAX_UPLOAD_MB = 5;
const MAX_LONG_SIDE = 1920;
const JPEG_QUALITY = 0.75;

// ✅ 9장(3x3)만 보이게
const THUMBS_PER_PAGE = 9;

type PhotoThumb = {
  name: string;
  url: string;
  created_at: string;
  uploader_name?: string | null;
};

type ModalType = null | "upload";

export function PhotoUpload() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [openModal, setOpenModal] = useState<ModalType>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] =
    useState<{ done: number; total: number } | null>(null);

  const [thumbs, setThumbs] = useState<PhotoThumb[]>([]);
  const [thumbLoading, setThumbLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const loadThumbs = async (targetPage = page) => {
    setThumbLoading(true);
    try {
      const offset = targetPage * THUMBS_PER_PAGE;

      // 1) 스토리지에서 파일 목록
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list("", {
          limit: THUMBS_PER_PAGE,
          offset,
          sortBy: { column: "created_at", order: "desc" },
        } as any);

      if (error) throw error;

      const files = (data ?? []).filter((f) => f.name && !f.name.startsWith("."));
      const fileNames = files.map((f) => f.name);

      // 2) photo_meta에서 uploader_name 가져오기
      let metaMap = new Map<string, string>();
      if (fileNames.length > 0) {
        const { data: metaData, error: metaError } = await supabase
          .from("photo_meta")
          .select("file_name, uploader_name")
          .in("file_name", fileNames);

        if (!metaError && metaData) {
          metaData.forEach((m) => {
            if (m.file_name) metaMap.set(m.file_name, m.uploader_name);
          });
        }
      }

      // 3) public url + 메타 병합
      const list: PhotoThumb[] = files.map((f) => {
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(f.name);

        return {
          name: f.name,
          url: urlData.publicUrl,
          created_at: f.created_at ?? "",
          uploader_name: metaMap.get(f.name) ?? null,
        };
      });

      setThumbs(list);
      setPage(targetPage);
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

  return (
    <section className="photo-upload">
      <h2 className="section-title">사진 업로드</h2>
      <p className="photo-upload__desc">
        하객분들이 직접 찍은 사진을 남겨주시면 감사하겠습니다.
        <br />
        여러 장을 한 번에 선택해도 자동으로 최적화되어 업로드됩니다.
      </p>

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
                  title={t.uploader_name ?? t.name}
                >
                  <img src={t.url} alt="uploaded" loading="lazy" />

                  {/* ✅ 업로더 이름 오버레이 */}
                  {t.uploader_name && (
                    <div className="thumb__label">{t.uploader_name}</div>
                  )}
                </a>
              ))}
            </div>

            {/* ✅ 페이지네이션 */}
            <div className="thumbs__pagination">
              <button
                className="page-btn"
                disabled={page === 0 || thumbLoading}
                onClick={() => loadThumbs(page - 1)}
                type="button"
              >
                이전
              </button>

              <div className="page-info">{page + 1} 페이지</div>

              <button
                className="page-btn"
                disabled={!hasNext || thumbLoading}
                onClick={() => loadThumbs(page + 1)}
                type="button"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>

      {/* ✅ 썸네일 아래 업로드 버튼 */}
      <div className="photo-upload__actions">
        <Button
          variant="basic"
          onClick={() => setOpenModal("upload")}
          disabled={loading}
        >
          사진 여러 장 업로드하기
        </Button>
      </div>

      {/* ✅ 업로드 모달 */}
      {openModal === "upload" && (
        <UploadPhotoModal
          fileRef={fileRef}
          loading={loading}
          onClose={() => setOpenModal(null)}
          onUploaded={() => loadThumbs(0)}
          setLoading={setLoading}
          setProgress={setProgress}
        />
      )}

      {/* ✅ hidden file input (모달에서 클릭) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        style={{ display: "none" }}
      />

      {/* 전역 로딩 텍스트(원하면 UI로 바꿔도 됨) */}
      {loading && progress && (
        <p className="photo-upload__progress">
          업로드 중... ({progress.done}/{progress.total})
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------
   Upload Modal (방명록 무드 / footer 2버튼 같은 행)
------------------------------------------------------------------ */

function UploadPhotoModal({
  fileRef,
  loading,
  onClose,
  onUploaded,
  setLoading,
  setProgress,
}: {
  fileRef: React.RefObject<HTMLInputElement>;
  loading: boolean;
  onClose: () => void;
  onUploaded: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setProgress: React.Dispatch<
    React.SetStateAction<{ done: number; total: number } | null>
  >;
}) {
  const [name, setName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onPickFiles = () => {
    if (!name.trim()) {
      alert("이름을 먼저 입력해주세요.");
      return;
    }
    fileRef.current?.click();
  };

  // 모달 열릴 때 file input change 핸들러 붙이기
  useEffect(() => {
    const el = fileRef.current;
    if (!el) return;

    const handler = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files ?? []);
      setSelectedFiles(files);
    };

    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [fileRef]);

  const onSubmitUpload = async () => {
    const uploaderName = name.trim();
    if (!uploaderName) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (selectedFiles.length === 0) {
      alert("사진을 선택해주세요.");
      return;
    }

    setLoading(true);
    setProgress({ done: 0, total: selectedFiles.length });

    const failed: string[] = [];
    let done = 0;

    for (const file of selectedFiles) {
      let filename = "";
      try {
        if (!file.type.startsWith("image/")) {
          failed.push(`${file.name} (이미지 아님)`);
          continue;
        }

        const optimized = await compressIfNeeded(file);

        const isHeic =
          optimized.type === "image/heic" ||
          optimized.type === "image/heif" ||
          /\.heic$/i.test(optimized.name) ||
          /\.heif$/i.test(optimized.name);

        let ext = "jpg";
        if (isHeic) {
          ext = (optimized.name.split(".").pop() || "heic").toLowerCase();
        } else if (optimized.type.includes("png")) {
          ext = "png";
        }

        const safeName = uploaderName
          .replace(/\s+/g, "")
          .replace(/[^\w가-힣]/g, "");

        filename = `${safeName}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(filename, optimized, { upsert: false });

        if (upErr) throw upErr;

        const { error: metaErr } = await supabase
          .from("photo_meta")
          .insert([
            {
              file_name: filename,
              uploader_name: uploaderName,
              created_at: new Date().toISOString(),
            },
          ]);

        if (metaErr) {
          console.warn("photo_meta insert failed:", metaErr);
          failed.push(`${file.name} (업로드는 됐지만 이름 저장 실패)`);
        }
      } catch (err: any) {
        console.error("Upload failed:", file.name, err);
        failed.push(`${file.name} (${err?.message ?? "알 수 없는 오류"})`);

        if (filename) {
          try {
            await supabase.storage.from(BUCKET).remove([filename]);
          } catch {}
        }
      } finally {
        done++;
        setProgress({ done, total: selectedFiles.length });
        await new Promise((r) => setTimeout(r, 120));
      }
    }

    setLoading(false);
    setProgress(null);
    setSelectedFiles([]);

    if (fileRef.current) fileRef.current.value = "";

    onUploaded();

    if (failed.length === 0) {
      alert("사진이 모두 업로드되었습니다! 감사합니다 😊");
      onClose();
    } else {
      alert(
        `일부 사진 업로드가 실패했어요.\n\n${failed.join("\n")}\n\n` +
          `다시 시도하거나 JPG로 변환 후 올려주세요.`
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      footer={
        <div className="photo-footer-row">
          <Button
            variant="submit"
            type="button"
            onClick={onSubmitUpload}
            disabled={loading}
          >
            업로드하기
          </Button>
          <Button variant="close" type="button" onClick={onClose}>
            닫기
          </Button>
        </div>
      }
    >
      <div className="photo-modal-content">
        <h2 className="modal-title">사진 업로드하기</h2>

        <div className="photo-form">
          <label className="label">이름 *</label>
          <input
            disabled={loading}
            type="text"
            autoComplete="off"
            placeholder="이름을 입력해주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="label">사진 선택 *</label>
          <button
            type="button"
            className="photo-pick-btn"
            onClick={onPickFiles}
            disabled={loading}
          >
            사진 여러 장 선택하기
          </button>

          {selectedFiles.length > 0 && (
            <div className="photo-picked-info">
              {selectedFiles.length}장 선택됨
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* -----------------------------------------------------------
   자동 압축/리사이즈
   ✅ HEIC/HEIF는 압축 시도 안 하고 원본 업로드
----------------------------------------------------------- */
async function compressIfNeeded(file: File): Promise<File> {
  const sizeMB = file.size / (1024 * 1024);

  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  if (isHeic) return file;

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
