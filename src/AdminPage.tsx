import { useEffect, useMemo, useState } from "react";
import "./AdminPage.scss";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
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

  const [tab, setTab] =
    useState<"attendance" | "guestbook" | "photos">("attendance");

  // ✅ 관리자 인증 상태 로드
  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored === "true") {
      setAdminOk(true);
      setNeedAuthModal(false);
    }
  }, []);

  // ✅ 데이터 로드(참석/방명록)
  const loadAll = async () => {
    setLoading(true);
    try {
      const [attRes, gbRes] = await Promise.all([
        supabase
          .from("attendance")
          .select("id, name, phone, side, count, meal, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("guestbook")
          .select("id, name, content, created_at")
          .order("created_at", { ascending: false }),
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
    <section className="admin-page">
      <h2 className="section-title">관리자 페이지</h2>

      {/* ✅ 관리자 인증 */}
      {!adminOk && needAuthModal && (
        <AdminAuthModal
          onClose={() => setNeedAuthModal(false)}
          onSuccess={() => {
            localStorage.setItem(ADMIN_STORAGE_KEY, "true");
            setAdminOk(true);
            setNeedAuthModal(false);
          }}
        />
      )}

      {adminOk && (
        <>
          <div className="admin-actions">
            <Button variant="outline" onClick={loadAll} disabled={loading}>
              새로고침
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem(ADMIN_STORAGE_KEY);
                setAdminOk(false);
                setNeedAuthModal(true);
              }}
            >
              로그아웃
            </Button>
          </div>

          {/* ✅ 탭 */}
          <div className="admin-tabs">
            <button
              className={`tab ${tab === "attendance" ? "active" : ""}`}
              onClick={() => setTab("attendance")}
            >
              참석여부 ({attendance.length})
            </button>

            <button
              className={`tab ${tab === "guestbook" ? "active" : ""}`}
              onClick={() => setTab("guestbook")}
            >
              방명록 ({guestbook.length})
            </button>

            <button
              className={`tab ${tab === "photos" ? "active" : ""}`}
              onClick={() => setTab("photos")}
            >
              사진
            </button>
          </div>

          {/* ✅ 탭 내용 */}
          {tab === "photos" ? (
            <AdminPhotos />
          ) : loading ? (
            <div className="admin-loading">불러오는 중…</div>
          ) : tab === "attendance" ? (
            <AttendanceAdmin attendance={attendance} />
          ) : (
            <GuestbookAdmin guestbook={guestbook} />
          )}
        </>
      )}
    </section>
  );
}

/* ======================================================================
   관리자 인증 모달
====================================================================== */

function AdminAuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");

  return (
    <Modal onClose={onClose}>
      <div className="admin-modal">
        <h2 className="modal-heading modal-divider">관리자 인증</h2>

        <p className="admin-modal__desc">관리자 코드를 입력해주세요.</p>

        <input
          type="password"
          placeholder="관리자 코드"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <div className="admin-modal__actions">
          <Button
            variant="outline"
            onClick={() => {
              if (!ADMIN_CODE) {
                alert("VITE_ADMIN_CODE가 설정되어 있지 않습니다.");
                return;
              }
              if (code.trim() !== ADMIN_CODE) {
                alert("코드가 올바르지 않습니다.");
                return;
              }
              onSuccess();
            }}
          >
            확인
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ======================================================================
   Attendance 관리자 뷰
====================================================================== */

function AttendanceAdmin({ attendance }: { attendance: AttendanceRow[] }) {
  const totalCount = attendance.reduce((sum, r) => sum + (r.count || 0), 0);
  const groomCount = attendance
    .filter((r) => r.side === "groom")
    .reduce((s, r) => s + r.count, 0);
  const brideCount = attendance
    .filter((r) => r.side === "bride")
    .reduce((s, r) => s + r.count, 0);

  const mealYes = attendance
    .filter((r) => r.meal === "yes")
    .reduce((s, r) => s + r.count, 0);
  const mealNo = attendance
    .filter((r) => r.meal === "no")
    .reduce((s, r) => s + r.count, 0);
  const mealUnknown = attendance
    .filter((r) => r.meal === "unknown")
    .reduce((s, r) => s + r.count, 0);

  const downloadCSV = () => {
    const header = ["id", "name", "phone", "side", "count", "meal", "created_at"];
    const rows = attendance.map((r) => [
      r.id,
      r.name,
      r.phone,
      r.side,
      r.count,
      r.meal,
      r.created_at,
    ]);

    const csv = [header, ...rows]
      .map((line) =>
        line.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-box">
      <div className="admin-summary">
        <div className="sum-item">
          <div className="label">총 참석 인원</div>
          <div className="value">{totalCount}명</div>
        </div>
        <div className="sum-item">
          <div className="label">신랑 측</div>
          <div className="value">{groomCount}명</div>
        </div>
        <div className="sum-item">
          <div className="label">신부 측</div>
          <div className="value">{brideCount}명</div>
        </div>
        <div className="sum-item">
          <div className="label">식사 예정</div>
          <div className="value">{mealYes}명</div>
        </div>
        <div className="sum-item">
          <div className="label">식사 안 함</div>
          <div className="value">{mealNo}명</div>
        </div>
        <div className="sum-item">
          <div className="label">식사 미정</div>
          <div className="value">{mealUnknown}명</div>
        </div>
      </div>

      <div className="admin-sub-actions">
        <Button variant="outline" onClick={downloadCSV}>
          CSV 다운로드
        </Button>
      </div>

      <div className="admin-list">
        {attendance.map((r) => (
          <div key={r.id} className="admin-row">
            <div className="row-top">
              <span className="name">{r.name}</span>
              <span className="badge">
                {r.side === "groom" ? "신랑 측" : "신부 측"}
              </span>
            </div>

            <div className="row-mid">
              <div className="meta">전화번호: {r.phone}</div>
              <div className="meta">인원: {r.count}명</div>
              <div className="meta">식사: {mealLabel(r.meal)}</div>
            </div>

            <div className="row-bottom">
              {new Date(r.created_at).toLocaleString()}
            </div>
          </div>
        ))}

        {attendance.length === 0 && (
          <div className="empty">아직 참석 응답이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   Guestbook 관리자 뷰
====================================================================== */

function GuestbookAdmin({ guestbook }: { guestbook: GuestbookRow[] }) {
  const downloadCSV = () => {
    const header = ["id", "name", "content", "created_at"];
    const rows = guestbook.map((r) => [
      r.id,
      r.name,
      r.content,
      r.created_at,
    ]);

    const csv = [header, ...rows]
      .map((line) =>
        line.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guestbook.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-box">
      <div className="admin-sub-actions">
        <Button variant="outline" onClick={downloadCSV}>
          CSV 다운로드
        </Button>
      </div>

      <div className="admin-list">
        {guestbook.map((r) => (
          <div key={r.id} className="admin-row">
            <div className="row-top">
              <span className="name">{r.name}</span>
              <span className="badge">방명록</span>
            </div>

            <div className="row-mid">
              <div className="content">{r.content}</div>
            </div>

            <div className="row-bottom">
              {new Date(r.created_at).toLocaleString()}
            </div>
          </div>
        ))}

        {guestbook.length === 0 && (
          <div className="empty">아직 방명록이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   ✅ AdminPhotos (내부 통합 컴포넌트)
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

  // page mode pagination
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // selected by name
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // name -> publicUrl
  const toPhotoItem = (f: any): PhotoItem => {
    const { data: urlData } = supabase.storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(f.name);
    return {
      name: f.name,
      url: urlData.publicUrl,
      created_at: f.created_at ?? "",
      size: f.metadata?.size ?? 0,
    };
  };

  // meta map
  const fetchMetaMap = async (names: string[]) => {
    const map = new Map<string, { uploader_name: string; created_at: string }>();
    if (names.length === 0) return map;

    for (let i = 0; i < names.length; i += META_CHUNK) {
      const chunk = names.slice(i, i + META_CHUNK);
      const { data, error } = await supabase
        .from("photo_meta")
        .select("file_name, uploader_name, created_at")
        .in("file_name", chunk);

      if (error) {
        console.warn("photo_meta fetch error:", error);
        continue;
      }

      (data ?? []).forEach((row: any) => {
        map.set(row.file_name, {
          uploader_name: row.uploader_name,
          created_at: row.created_at,
        });
      });
    }

    return map;
  };

  const attachMeta = async (list: PhotoItem[]) => {
    const names = list.map((p) => p.name);
    const metaMap = await fetchMetaMap(names);

    return list.map((p) => {
      const m = metaMap.get(p.name);
      return {
        ...p,
        uploader_name: m?.uploader_name ?? "익명",
        meta_created_at: m?.created_at ?? "",
      };
    });
  };

  // page load
  const loadPage = async (targetPage = page) => {
    setLoading(true);
    try {
      const offset = targetPage * PER_PAGE;
      const { data, error } = await supabase.storage.from(PHOTO_BUCKET).list("", {
        limit: PER_PAGE,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      } as any);

      if (error) throw error;

      const baseList = (data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map(toPhotoItem);

      const listWithMeta = await attachMeta(baseList);

      setPhotos(listWithMeta);
      setPage(targetPage);
      setHasNext(baseList.length === PER_PAGE);
      setSelected(new Set());
    } catch (e) {
      console.error(e);
      alert("사진 목록 불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // all load
  const loadAll = async () => {
    setLoading(true);
    try {
      let offset = 0;
      let all: PhotoItem[] = [];

      while (true) {
        const { data, error } = await supabase.storage.from(PHOTO_BUCKET).list("", {
          limit: ALL_CHUNK,
          offset,
          sortBy: { column: "created_at", order: "desc" },
        } as any);

        if (error) throw error;

        const chunk = (data ?? [])
          .filter((f) => f.name && !f.name.startsWith("."))
          .map(toPhotoItem);

        all = all.concat(chunk);

        if (chunk.length < ALL_CHUNK) break;
        offset += ALL_CHUNK;
      }

      const allWithMeta = await attachMeta(all);

      setPhotos(allWithMeta);
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

  useEffect(() => {
    if (mode === "page") loadPage(0);
    else loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // selection
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
      if (allSelectedOnScreen) photos.forEach((p) => next.delete(p.name));
      else photos.forEach((p) => next.add(p.name));
      return next;
    });
  };

  // delete helpers
  const removeMetaRows = async (names: string[]) => {
    const { error } = await supabase
      .from("photo_meta")
      .delete()
      .in("file_name", names);
    if (error) console.warn("meta delete failed:", error);
  };

  const deleteOne = async (name: string) => {
    const ok = confirm("이 사진을 삭제할까요? (삭제하면 복구 불가)");
    if (!ok) return;

    try {
      setLoading(true);

      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .remove([name]);
      if (error) throw error;

      await removeMetaRows([name]);

      alert("삭제되었습니다.");
      if (mode === "page") loadPage(page);
      else loadAll();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 실패");
      setLoading(false);
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) {
      alert("선택된 사진이 없습니다.");
      return;
    }

    const names = Array.from(selected);
    const ok = confirm(`${names.length}장을 일괄 삭제할까요?\n(삭제하면 복구 불가)`);
    if (!ok) return;

    try {
      setLoading(true);

      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .remove(names);
      if (error) throw error;

      await removeMetaRows(names);

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

  // download
  const downloadOne = async (name: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
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
              const uploader = p.uploader_name ?? "익명";
              const time = p.meta_created_at || p.created_at || "";

              return (
                <div
                  key={p.name}
                  className={`admin-photos__card ${checked ? "selected" : ""}`}
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
                      <div className="uploader">
                        업로드: <b>{uploader}</b>
                      </div>

                      <div className="sub">
                        {time ? new Date(time).toLocaleString() : ""}
                        {" · "}
                        {(p.size / 1024 / 1024).toFixed(2)}MB
                      </div>

                      <div className="name">{p.name}</div>
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
