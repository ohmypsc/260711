import { useEffect, useState } from "react";

import { Button } from "@/components/common/Button/Button";
import { supabase } from "@/supabaseClient";

const BUCKET = "wedding-photos";

type PhotoItem = {
  name: string;
  created_at: string;
  size: number;
};

export function AdminPhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list("", {
          limit: 1000,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      const mapped =
        (data ?? []).map((f) => ({
          name: f.name,
          created_at: f.created_at ?? "",
          size: f.metadata?.size ?? 0,
        })) as PhotoItem[];

      setPhotos(mapped);
    } catch (e) {
      console.error(e);
      alert("사진 목록 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const downloadOne = async (name: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(name);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("다운로드 실패");
    }
  };

  const downloadAll = async () => {
    if (photos.length === 0) return;
    const ok = confirm(
      `총 ${photos.length}장을 순서대로 다운로드합니다.\n(브라우저가 여러 다운로드를 물어볼 수 있어요)`
    );
    if (!ok) return;

    for (const p of photos) {
      await downloadOne(p.name);
      await new Promise((r) => setTimeout(r, 150));
    }
  };

  return (
    <section className="admin-photos">
      <h3 className="admin-photos__title">하객 사진 모아보기</h3>

      <div className="admin-photos__actions">
        <Button variant="outline" onClick={load} disabled={loading}>
          새로고침
        </Button>
        <Button variant="outline" onClick={downloadAll} disabled={loading}>
          전체 다운로드
        </Button>
      </div>

      {loading ? (
        <div className="loading">불러오는 중…</div>
      ) : (
        <div className="photo-list">
          {photos.map((p) => (
            <div key={p.name} className="photo-row">
              <div className="left">
                <div className="name">{p.name}</div>
                <div className="meta">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleString()
                    : ""}
                  {" · "}
                  {(p.size / 1024 / 1024).toFixed(2)}MB
                </div>
              </div>

              <button
                className="download-btn"
                onClick={() => downloadOne(p.name)}
              >
                다운로드
              </button>
            </div>
          ))}

          {photos.length === 0 && (
            <div className="empty">아직 업로드된 사진이 없습니다.</div>
          )}
        </div>
      )}
    </section>
  );
}
