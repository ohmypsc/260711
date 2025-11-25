import { useEffect, useState } from "react";
import "./AdminPage.scss";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

/* ------------------------------------------------------------------
   타입/상수
------------------------------------------------------------------ */

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

const ADMIN_STORAGE_KEY = "admin_authed";
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || "";

const mealLabel = (m: Meal) =>
  m === "yes" ? "식사 예정" : m === "no" ? "식사 안 함" : "식사 미정";

/* ------------------------------------------------------------------
   ✅ AdminPage (메인)
------------------------------------------------------------------ */

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

  // ✅ 데이터 로드(참석/방명록만)
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

          {/* ✅ 탭 3개 */}
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

/* ------------------------------------------------------------------
   관리자 인증 모달
------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------
   Attendance 관리자 뷰
------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------
   Guestbook 관리자 뷰
------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------
   ✅ AdminPhotos (사진 관리자 뷰) - 내부 컴포넌트로 통합
------------------------------------------------------------------ */

const PHOTO_BUCKET = "wedding-photos";
const PER_PAGE = 36;

type PhotoItem = {
  name: string;
  url: string;
  created_at: string;
  size: number;
};

function AdminPhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const offset = targetPage * PER_PAGE;

      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
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
            .from(PHOTO_BUCKET)
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
      const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([name]);
      if (error) throw error;

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
