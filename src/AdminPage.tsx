import { useEffect, useMemo, useState } from "react";
import "./AdminPage.scss";
import { supabase } from "@/supabaseClient";

/* ======================================================================
   타입
====================================================================== */
type Meal = "yes" | "no" | "unknown";
type Side = "groom" | "bride";

type AttendanceRow = {
  id: number;
  name: string;
  phone: string;
  side: Side;
  count: number;
  meal: Meal;
  created_at: string;
};

type GuestbookRow = {
  id: number;
  name: string;
  content: string;
  created_at: string;
};

/* ======================================================================
   관리자 설정
====================================================================== */
const ADMIN_STORAGE_KEY = "admin_authed";
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || "";

const mealLabel = (m: Meal) =>
  m === "yes" ? "식사 예정" : m === "no" ? "식사 안 함" : "식사 미정";

/* ======================================================================
   메인 AdminPage
====================================================================== */
export function AdminPage() {
  const [adminOk, setAdminOk] = useState(false);
  const [needAuthModal, setNeedAuthModal] = useState(true);

  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"attendance" | "guestbook" | "photos">("attendance");

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored === "true") {
      setAdminOk(true);
      setNeedAuthModal(false);
    }
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [attRes, gbRes] = await Promise.all([
        supabase.from("attendance").select("*").order("created_at", { ascending: false }),
        supabase.from("guestbook").select("*").order("created_at", { ascending: false }),
      ]);

      if (attRes.error) throw attRes.error;
      if (gbRes.error) throw gbRes.error;

      setAttendance((attRes.data ?? []) as AttendanceRow[]);
      setGuestbook((gbRes.data ?? []) as GuestbookRow[]);
    } catch (e) {
      console.error(e);
      alert("관리자 데이터 로딩에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminOk) loadAll();
  }, [adminOk]);

  return (
    <div className="admin-page">
      {/* ✅ 관리자 인증 모달 (직접 구현) */}
      {!adminOk && needAuthModal && (
        <AdminAuthModal
          onSuccess={() => {
            localStorage.setItem(ADMIN_STORAGE_KEY, "true");
            setAdminOk(true);
            setNeedAuthModal(false);
          }}
        />
      )}

      {adminOk && (
        <>
          <div className="admin-header">
            <h2 className="section-title">Admin Dashboard</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="admin-btn" onClick={loadAll} disabled={loading}>
                🔄 새로고침
              </button>
              <button
                className="admin-btn"
                onClick={() => {
                  localStorage.removeItem(ADMIN_STORAGE_KEY);
                  setAdminOk(false);
                  setNeedAuthModal(true);
                }}
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* ✅ 탭 */}
          <div className="admin-tabs">
            <button className={`tab ${tab === "attendance" ? "active" : ""}`} onClick={() => setTab("attendance")}>
              참석여부 ({attendance.length})
            </button>
            <button className={`tab ${tab === "guestbook" ? "active" : ""}`} onClick={() => setTab("guestbook")}>
              방명록 ({guestbook.length})
            </button>
            <button className={`tab ${tab === "photos" ? "active" : ""}`} onClick={() => setTab("photos")}>
              사진 관리
            </button>
          </div>

          {/* ✅ 탭 내용 */}
          {tab === "photos" ? (
            <AdminPhotos />
          ) : loading ? (
            <div className="admin-loading">데이터를 불러오는 중입니다...</div>
          ) : tab === "attendance" ? (
            <AttendanceAdmin attendance={attendance} />
          ) : (
            <GuestbookAdmin guestbook={guestbook} />
          )}
        </>
      )}
    </div>
  );
}

/* ======================================================================
   관리자 인증 모달 컴포넌트
====================================================================== */
function AdminAuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");

  const handleConfirm = () => {
    if (!ADMIN_CODE) {
      alert("환경변수(VITE_ADMIN_CODE)가 설정되어 있지 않습니다.");
      return;
    }
    if (code.trim() !== ADMIN_CODE) {
      alert("코드가 올바르지 않습니다.");
      return;
    }
    onSuccess();
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <h2>관리자 인증</h2>
        <p>안전한 관리를 위해 비밀번호를 입력해주세요.</p>
        <input
          type="password"
          placeholder="관리자 코드 입력"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
        />
        <button className="admin-btn primary" onClick={handleConfirm}>
          접속하기
        </button>
      </div>
    </div>
  );
}

/* ======================================================================
   Attendance 관리자 뷰
====================================================================== */
function AttendanceAdmin({ attendance }: { attendance: AttendanceRow[] }) {
  const totalCount = attendance.reduce((sum, r) => sum + (r.count || 0), 0);
  const groomCount = attendance.filter((r) => r.side === "groom").reduce((s, r) => s + r.count, 0);
  const brideCount = attendance.filter((r) => r.side === "bride").reduce((s, r) => s + r.count, 0);
  const mealYes = attendance.filter((r) => r.meal === "yes").reduce((s, r) => s + r.count, 0);
  const mealNo = attendance.filter((r) => r.meal === "no").reduce((s, r) => s + r.count, 0);
  const mealUnknown = attendance.filter((r) => r.meal === "unknown").reduce((s, r) => s + r.count, 0);

  const downloadCSV = () => {
    const header = ["이름", "연락처", "구분", "참석인원", "식사여부", "작성일시"];
    const rows = attendance.map((r) => [
      r.name,
      r.phone,
      r.side === "groom" ? "신랑측" : "신부측",
      r.count,
      mealLabel(r.meal),
      new Date(r.created_at).toLocaleString(),
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // 한글 깨짐 방지 BOM 추가
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "참석자명단.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="admin-summary">
        <div className="sum-item highlight"><div className="label">총 참석 인원</div><div className="value">{totalCount}명</div></div>
        <div className="sum-item"><div className="label">신랑 측</div><div className="value">{groomCount}명</div></div>
        <div className="sum-item"><div className="label">신부 측</div><div className="value">{brideCount}명</div></div>
        <div className="sum-item"><div className="label">식사 하심</div><div className="value">{mealYes}명</div></div>
        <div className="sum-item"><div className="label">식사 안함</div><div className="value">{mealNo}명</div></div>
        <div className="sum-item"><div className="label">미정</div><div className="value">{mealUnknown}명</div></div>
      </div>

      <div className="admin-toolbar">
        <button className="admin-btn" onClick={downloadCSV}>📥 엑셀(CSV) 다운로드</button>
      </div>

      <div className="admin-list">
        {attendance.map((r) => (
          <div key={r.id} className="admin-card">
            <div className="card-header">
              <span className="name">{r.name}</span>
              <span className="badge">{r.side === "groom" ? "🤵 신랑 측" : "👰 신부 측"}</span>
            </div>
            <div className="card-body">
              <div className="meta-line">📞 {r.phone}</div>
              <div className="meta-line">👥 동행인 포함 <b>{r.count}명</b> 참석</div>
              <div className="meta-line">🍽️ {mealLabel(r.meal)}</div>
            </div>
            <div className="card-footer">{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
        {attendance.length === 0 && <div className="empty">아직 참석 응답이 없습니다.</div>}
      </div>
    </div>
  );
}

/* ======================================================================
   Guestbook 관리자 뷰
====================================================================== */
function GuestbookAdmin({ guestbook }: { guestbook: GuestbookRow[] }) {
  const downloadCSV = () => {
    const header = ["이름", "내용", "작성일시"];
    const rows = guestbook.map((r) => [r.name, r.content, new Date(r.created_at).toLocaleString()]);
    const csv = [header, ...rows]
      .map((line) => line.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "방명록.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="admin-toolbar">
        <button className="admin-btn" onClick={downloadCSV}>📥 엑셀(CSV) 다운로드</button>
      </div>
      <div className="admin-list">
        {guestbook.map((r) => (
          <div key={r.id} className="admin-card">
            <div className="card-header">
              <span className="name">{r.name}</span>
              <span className="badge" style={{ background: '#f1f3f5', color: '#495057' }}>방명록</span>
            </div>
            <div className="card-body">
              <div className="content-box">{r.content}</div>
            </div>
            <div className="card-footer">{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
        {guestbook.length === 0 && <div className="empty">아직 작성된 방명록이 없습니다.</div>}
      </div>
    </div>
  );
}

/* ======================================================================
   AdminPhotos 사진 관리
====================================================================== */
const PHOTO_BUCKET = "wedding-photos";
const PER_PAGE = 36;
const ALL_CHUNK = 200;
const META_CHUNK = 200;

type PhotoItem = {
  name: string;
  url: string;
  created_at: string;
  size: number;
  uploader_name?: string;
  meta_created_at?: string;
};

type ViewMode = "page" | "all";

function AdminPhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>("page");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toPhotoItem = (f: any): PhotoItem => {
    const { data: urlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(f.name);
    return { name: f.name, url: urlData.publicUrl, created_at: f.created_at ?? "", size: f.metadata?.size ?? 0 };
  };

  const fetchMetaMap = async (names: string[]) => {
    const map = new Map<string, { uploader_name: string; created_at: string }>();
    if (names.length === 0) return map;
    for (let i = 0; i < names.length; i += META_CHUNK) {
      const chunk = names.slice(i, i + META_CHUNK);
      const { data } = await supabase.from("photo_meta").select("file_name, uploader_name, created_at").in("file_name", chunk);
      (data ?? []).forEach((row: any) => map.set(row.file_name, { uploader_name: row.uploader_name, created_at: row.created_at }));
    }
    return map;
  };

  const attachMeta = async (list: PhotoItem[]) => {
    const metaMap = await fetchMetaMap(list.map((p) => p.name));
    return list.map((p) => ({ ...p, uploader_name: metaMap.get(p.name)?.uploader_name ?? "익명", meta_created_at: metaMap.get(p.name)?.created_at ?? "" }));
  };

  const loadPage = async (targetPage = page) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(PHOTO_BUCKET).list("", {
        limit: PER_PAGE, offset: targetPage * PER_PAGE, sortBy: { column: "created_at", order: "desc" },
      } as any);
      if (error) throw error;
      const baseList = (data ?? []).filter((f) => f.name && !f.name.startsWith(".")).map(toPhotoItem);
      const listWithMeta = await attachMeta(baseList);
      setPhotos(listWithMeta); setPage(targetPage); setHasNext(baseList.length === PER_PAGE); setSelected(new Set());
    } catch (e) { alert("사진을 불러오지 못했습니다."); } finally { setLoading(false); }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      let offset = 0, all: PhotoItem[] = [];
      while (true) {
        const { data, error } = await supabase.storage.from(PHOTO_BUCKET).list("", { limit: ALL_CHUNK, offset, sortBy: { column: "created_at", order: "desc" } } as any);
        if (error) throw error;
        const chunk = (data ?? []).filter((f) => f.name && !f.name.startsWith(".")).map(toPhotoItem);
        all = all.concat(chunk);
        if (chunk.length < ALL_CHUNK) break;
        offset += ALL_CHUNK;
      }
      setPhotos(await attachMeta(all)); setHasNext(false); setSelected(new Set()); setPage(0);
    } catch (e) { alert("전체 사진을 불러오지 못했습니다."); } finally { setLoading(false); }
  };

  useEffect(() => { mode === "page" ? loadPage(0) : loadAll(); }, [mode]);

  const toggleSelect = (name: string) => setSelected((prev) => { const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next; });
  const allSelected = useMemo(() => photos.length > 0 && photos.every((p) => selected.has(p.name)), [photos, selected]);
  const selectAll = () => setSelected((prev) => { const next = new Set(prev); allSelected ? photos.forEach(p => next.delete(p.name)) : photos.forEach(p => next.add(p.name)); return next; });

  const deleteOne = async (name: string) => {
    if (!confirm("이 사진을 삭제할까요?")) return;
    setLoading(true);
    try {
      await supabase.storage.from(PHOTO_BUCKET).remove([name]);
      await supabase.from("photo_meta").delete().in("file_name", [name]);
      mode === "page" ? loadPage(page) : loadAll();
    } catch (e) { alert("삭제 실패"); setLoading(false); }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return alert("선택된 사진이 없습니다.");
    const names = Array.from(selected);
    if (!confirm(`${names.length}장을 일괄 삭제할까요?`)) return;
    setLoading(true);
    try {
      await supabase.storage.from(PHOTO_BUCKET).remove(names);
      await supabase.from("photo_meta").delete().in("file_name", names);
      mode === "page" ? loadPage(page) : loadAll();
    } catch (e) { alert("삭제 실패"); setLoading(false); }
  };

  const downloadOne = async (name: string) => {
    try {
      const { data } = await supabase.storage.from(PHOTO_BUCKET).download(name);
      if (!data) return;
      const url = URL.createObjectURL(data), a = document.createElement("a");
      a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert("다운로드 실패"); }
  };

  const downloadAllOnScreen = async () => {
    if (photos.length === 0) return;
    if (!confirm(`화면의 ${photos.length}장을 다운로드합니다. (브라우저 팝업 허용 필요)`)) return;
    for (const p of photos) { await downloadOne(p.name); await new Promise(r => setTimeout(r, 150)); }
  };

  return (
    <div className="admin-photos">
      <div className="photos-toolbar">
        <button className="admin-btn" onClick={() => setMode(mode === "page" ? "all" : "page")} disabled={loading}>
          {mode === "page" ? "전체보기" : "페이지별 보기"}
        </button>
        <button className="admin-btn" onClick={selectAll} disabled={loading || photos.length === 0}>
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
        <button className="admin-btn" onClick={downloadAllOnScreen} disabled={loading || photos.length === 0}>
          화면 전체 다운로드
        </button>
        <button className="admin-btn danger" onClick={deleteSelected} disabled={loading || selected.size === 0}>
          선택 삭제 ({selected.size})
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">사진을 불러오는 중...</div>
      ) : photos.length === 0 ? (
        <div className="empty">업로드된 사진이 없습니다.</div>
      ) : (
        <>
          <div className="photos-grid">
            {photos.map((p) => {
              const checked = selected.has(p.name);
              const time = p.meta_created_at || p.created_at;
              return (
                <div key={p.name} className={`photo-card ${checked ? "selected" : ""}`}>
                  <label className="check-wrap">
                    <input type="checkbox" checked={checked} onChange={() => toggleSelect(p.name)} />
                    <div className="checkbox" />
                  </label>
                  <a href={p.url} target="_blank" rel="noreferrer">
                    <img src={p.url} alt="guest upload" loading="lazy" />
                  </a>
                  <div className="photo-info">
                    <div className="uploader">{p.uploader_name ?? "익명"}</div>
                    <div className="date-size">
                      {time ? new Date(time).toLocaleDateString() : ""} · {(p.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <div className="action-btns">
                      <button className="admin-btn" onClick={() => downloadOne(p.name)}>저장</button>
                      <button className="admin-btn danger" onClick={() => deleteOne(p.name)}>삭제</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {mode === "page" && (
            <div className="pagination">
              <button className="admin-btn" disabled={page === 0 || loading} onClick={() => loadPage(page - 1)}>
                이전 페이지
              </button>
              <div className="page-info">{page + 1}</div>
              <button className="admin-btn" disabled={!hasNext || loading} onClick={() => loadPage(page + 1)}>
                다음 페이지
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
