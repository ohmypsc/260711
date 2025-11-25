import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { supabase } from "@/supabaseClient";

const BUCKET = "wedding-photos";
const PER_PAGE = 36;

// 전체보기에서 한 번에 긁어올 chunk 크기(100~500 정도가 안전)
const ALL_CHUNK = 200;

type PhotoItem = {
  name: string;
  url: string;
  created_at: string;
  size: number;
};

type ViewMode = "page" | "all";

export function AdminPhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<ViewMode>("page");

  // page mode pagination
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // selected by name
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ---------------------------
  // 공통: name -> publicUrl
  // ---------------------------
  const toPhotoItem = (f: any): PhotoItem => {
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
    return {
      name: f.name,
      url: urlData.publicUrl,
      created_at: f.created_at ?? "",
      size: f.metadata?.size ?? 0,
    };
  };

  // ---------------------------
  // ✅ 페이지 단위 로드
  // ---------------------------
  const loadPage = async (targetPage = page) => {
    setLoading(true);
    try {
      const offset = targetPage * PER_PAGE;

      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        limit: PER_PAGE,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      } as any);

      if (error) throw error;

      const list = (data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map(toPhotoItem);

      setPhotos(list);
      setPage(targetPage);
      setHasNext(list.length === PER_PAGE);
      setSelected(new Set());
    } catch (e) {
      console.error(e);
      alert("사진 목록 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // ✅ 전체 로드(여러 번 list 돌림)
  // ---------------------------
  const loadAll = async () => {
    setLoading(true);
    try {
      let offset = 0;
      let all: PhotoItem[] = [];

      while (true) {
        const { data, error } = await supabase.storage.from(BUCKET).list("", {
          limit: ALL_CHUNK,
          offset,
          sortBy: { column: "created_at", order: "desc" },
        } as any);

        if (error) throw error;

        const chunk = (data ?? [])
          .filter((f) => f.name && !f.name.startsWith("."))
          .map(toPhotoItem);

        all = all.concat(chunk);

        if (chunk.length < ALL_CHUNK) break; // 더 이상 없음
        offset += ALL_CHUNK;
      }

      setPhotos(all);
      setHasNext(false);
      setSelected(new Set());
      setPage(0);
    } catch (e) {
      console.error(e);
      alert("전체 사진 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // ✅ 모드 변경 시 로드
  // ---------------------------
  useEffect(() => {
    if (mode === "page") loadPage(0);
    else loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ---------------------------
  // selection helpers
  // ---------------------------
  const toggleSelect = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const allSelectedOnScreen = useMemo(() => {
    if (photos.length === 0) return false;
    return photos.every((p) => selected.has(p.name));
  }, [photos, selected]);

  const selectAllOnScreen = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedOnScreen) {
        photos.forEach((p) => next.delete(p.name));
      } else {
        photos.forEach((p) => next.add(p.name));
      }
      return next;
    });
  };

  // ---------------------------
  // delete
  // ---------------------------
  const deleteOne = async (name: string) => {
    const ok = confirm("이 사진을 삭제할까요? (삭제하면 복구 불가)");
    if (!ok) return;

    try {
      const { error } = await supabase.storage.from(BUCKET).remove([name]);
      if (error) throw error;

      alert("삭제되었습니다.");
      if (mode === "page") loadPage(page);
      else loadAll();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 실패");
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) {
      alert("선택된 사진이 없습니다.");
      return;
    }

    const names = Array.from(selected);
    const ok = confirm(
      `${names.length}장을 일괄 삭제할까요?\n(삭제하면 복구 불가)`
    );
    if (!ok) return;

    try {
      setLoading(true);
      const { error } = await supabase.storage.from(BUCKET).remove(names);
      if (error) throw error;

      alert(`${names.length}장 삭제 완료!`);
      if (mode === "page") loadPage(page);
      else loadAll();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "일괄 삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // download
  // ---------------------------
  const downloadOne = async (name: string) => {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(name);
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

  const downloadAllOnScreen = async () => {
    if (photos.length === 0) return;
    const ok = confirm(
      `현재 화면의 ${photos.length}장을 순서대로 다운로드합니다.\n(브라우저가 여러 다운로드를 물어볼 수 있어요)`
    );
    if (!ok) return;

    for (const p of photos) {
      await downloadOne(p.name);
      await new Promise((r) => setTimeout(r, 120));
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <section className="admin-photos admin-box">
      <h3 className="admin-photos__title">하객 사진 모아보기</h3>

      <div className="admin-photos__actions">
        <Button
          variant="outline"
          onClick={() => setMode(mode === "page" ? "all" : "page")}
          disabled={loading}
        >
          {mode === "page" ? "전체보기" : "페이지보기"}
        </Button>

        <Button
          variant="outline"
          onClick={() => (mode === "page" ? loadPage(0) : loadAll())}
          disabled={loading}
        >
          새로고침
        </Button>

        <Button
          variant="outline"
          onClick={selectAllOnScreen}
          disabled={loading || photos.length === 0}
        >
          {allSelectedOnScreen ? "전체 해제" : "전체 선택"}
        </Button>

        <Button
          variant="outline"
          onClick={deleteSelected}
          disabled={loading || selected.size === 0}
        >
          선택 삭제 ({selected.size})
        </Button>

        <Button
          variant="outline"
          onClick={downloadAllOnScreen}
          disabled={loading || photos.length === 0}
        >
          현재 화면 다운로드
        </Button>
      </div>

      {loading ? (
        <div className="admin-loading">불러오는 중…</div>
      ) : photos.length === 0 ? (
        <div className="empty">아직 업로드된 사진이 없습니다.</div>
      ) : (
        <>
          <div className="admin-photos__grid">
            {photos.map((p) => {
              const checked = selected.has(p.name);
              return (
                <div
                  key={p.name}
                  className={`admin-photos__card ${
                    checked ? "selected" : ""
                  }`}
                >
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(p.name)}
                    />
                    <span />
                  </label>

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
              );
            })}
          </div>

          {/* page mode 에서만 페이지네이션 노출 */}
          {mode === "page" && (
            <div className="admin-photos__pagination">
              <button
                className="page-btn"
                disabled={page === 0 || loading}
                onClick={() => loadPage(page - 1)}
              >
                이전
              </button>

              <div className="page-info">{page + 1} 페이지</div>

              <button
                className="page-btn"
                disabled={!hasNext || loading}
                onClick={() => loadPage(page + 1)}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
