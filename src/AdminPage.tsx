import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

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

export function AdminPage() {
  const [adminOk, setAdminOk] = useState(false);
  const [needAuthModal, setNeedAuthModal] = useState(true);

  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"attendance" | "guestbook">("attendance");

  // ✅ 관리자 인증 상태 로드
  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored === "true") {
      setAdminOk(true);
      setNeedAuthModal(false);
    }
  }, []);

  // ✅ 데이터 로드
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
          </div>

          {loading ? (
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

export default AdminPage;
