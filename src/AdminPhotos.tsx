import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { supabase } from "@/supabaseClient";

const BUCKET = "wedding-photos";
const PER_PAGE = 36;

type PhotoItem = {
  name: string;
  url: string;
  created_at: string;
  size: number;
};

export function AdminPhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const offset = targetPage * PER_PAGE;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list("", {
          limit: PER_PAGE,
          offset,
          sortBy: { column: "created_at", order: "desc" },
        } as any);

      if (error) throw error;

      const list: PhotoItem[] = (data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => {
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(f.name);

          return {
            name: f.name,
            url: urlData.publicUrl,
            created_at: f.created_at ?? "",
            size: f.metadata?.size ?? 0,
          };
        });

      setPhotos(list);
      setPage(targetPage);
      setHasNext(list.length === PER_PAGE);
    } catch (e) {
      console.error(e);
      alert("사진 목록 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteOne = async (name: string) => {
    const ok = confirm("이 사진을 삭제할까요? (삭제하면 복구 불가)");
    if (!ok) return;

    try {
      const { error } = await supabase.storage.from(BUCKET).remove([name]);
      if (error) throw error;

      // 현재 페이지 다시 로드
      load(page);
      alert("삭제되었습니다.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 실패");
    }
  };

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
      `현재 페이지의 ${photos.length}장을 순서대로 다운로드합니다.\n(브라우저가 여러 다운로드를 물어볼 수 있어요)`
    );
    if (!ok) return;

    for (const p of photos) {
      await downloadOne(p.name);
      await new Promise((r) => setTimeout(r, 120));
    }
  };

  return (
    <section className="admin-photos admin-box">
      <h3 className="admin-photos__title">하객 사진 모아보기</h3>

      <div className="admin-photos__actions">
        <Button variant="outline" onClick={() => load(0)} disabled={loading}>
          새로고침
        </Button>
        <Button variant="outline" onClick={downloadAll} disabled={loading}>
          현재 페이지 다운로드
        </Button>
      </div>

      {loading ? (
        <div className="admin-loading">불러오는 중…</div>
      ) : photos.length === 0 ? (
        <div className="empty">아직 업로드된 사진이 없습니다.</div>
      ) : (
        <>
          {/* ✅ 썸네일 그리드 */}
          <div className="admin-photos__grid">
            {photos.map((p) => (
              <div key={p.name} className="admin-photos__card">
                <a href={p.url} target="_blank" rel="noreferrer">
                  <img src={p.url} alt="uploaded" loading="lazy" />
                </a>

                <div className="admin-photos__meta">
                  <div className="meta-left">
                    <div className="name">{p.name}</div>
                    <div className="sub">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : ""}
                      {" · "}
                      {(p.size / 1024 / 1024).toFixed(2)}MB
                    </div>
                  </div>

                  <div className="meta-actions">
                    <button
                      className="mini-btn"
                      onClick={() => downloadOne(p.name)}
                    >
                      다운로드
                    </button>
                    <button
                      className="mini-btn danger"
                      onClick={() => deleteOne(p.name)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ 페이지네이션 */}
          <div className="admin-photos__pagination">
            <button
              className="page-btn"
              disabled={page === 0 || loading}
              onClick={() => load(page - 1)}
            >
              이전
            </button>

            <div className="page-info">{page + 1} 페이지</div>

            <button
              className="page-btn"
              disabled={!hasNext || loading}
              onClick={() => load(page + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}
    </section>
  );
}
