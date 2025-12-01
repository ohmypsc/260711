import { useEffect, useState } from "react";
import "./Attendance.scss";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

type Side = "groom" | "bride";
type Meal = "yes" | "no" | "unknown";

type AttendanceRow = {
  id: number;
  name: string;
  phone: string; // ✅ DB에는 숫자만 저장
  count: number;
  side: Side;
  meal: Meal;
  created_at: string;
};

type ModalType =
  | null
  | "write"
  | "find"
  | { type: "edit"; row: AttendanceRow; authName: string; authPhone: string }
  | { type: "delete"; row: AttendanceRow; authName: string; authPhone: string };

const STORAGE_KEY = "attendance_ids";

/** ✅ 연락처 정규화: 숫자만 남김 */
const normalizePhone = (v: string) => v.replace(/\D/g, "");

/** ✅ 자동 하이픈 포맷(입력 UI용) */
const formatPhone = (digits: string) => {
  const d = digits.slice(0, 11);

  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9)
      return `${d.slice(0, 2)}-${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }

  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10)
    return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

const mealLabel = (meal: Meal) =>
  meal === "yes" ? "식사 예정" : meal === "no" ? "식사 안 함" : "식사 미정";

export function Attendance() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [myRows, setMyRows] = useState<AttendanceRow[]>([]);
  const hasMyRows = myRows.length > 0;

  const loadMyRows = async () => {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
    if (ids.length === 0) return;

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setMyRows((data ?? []) as AttendanceRow[]);
  };

  useEffect(() => {
    loadMyRows();
  }, []);

  const saveMyId = (id: number) => {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
    const next = Array.from(new Set([...prev, id])); // ✅ 중복 방지
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const removeMyId = (id: number) => {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(prev.filter((x) => x !== id))
    );
  };

  return (
    <section className="attendance">
      <h2 className="section-title">참석 여부 확인</h2>

      <p className="attendance__desc">
        참석 여부를 미리 알려주시면 예식 준비에 큰 도움이 됩니다.
      </p>

      {/* ✅ myRows 있으면 '내 응답 찾기' 숨김 */}
      <div className="attendance-buttons">
        <Button variant="basic" onClick={() => setOpenModal("write")}>
          참석여부 확인하기
        </Button>

        {!hasMyRows && (
          <Button variant="basic" onClick={() => setOpenModal("find")}>
            내 응답 찾기
          </Button>
        )}
      </div>

      {hasMyRows && (
        <div className="my-attendance">
          <h3 className="my-attendance__title">내 참석 응답</h3>

          {myRows.map((row) => (
            <div key={row.id} className="my-attendance__item">
              <div className="info">
                <span className="name">{row.name}</span>
                <span className="meta">
                  {row.side === "groom" ? "신랑 측" : "신부 측"} · {row.count}명 ·{" "}
                  {mealLabel(row.meal)}
                </span>
              </div>

              <div className="actions">
                <button
                  onClick={() =>
                    setOpenModal({
                      type: "edit",
                      row,
                      authName: row.name,
                      authPhone: row.phone,
                    })
                  }
                  className="mini-btn"
                  type="button"
                >
                  수정
                </button>

                <button
                  onClick={() =>
                    setOpenModal({
                      type: "delete",
                      row,
                      authName: row.name,
                      authPhone: row.phone,
                    })
                  }
                  className="mini-btn danger"
                  type="button"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openModal === "write" && (
        <WriteAttendanceModal
          onClose={() => setOpenModal(null)}
          onSuccess={(newRow) => {
            saveMyId(newRow.id);
            setMyRows((prev) => [newRow, ...prev]);
          }}
        />
      )}

      {openModal === "find" && (
        <FindAttendanceModal
          onClose={() => setOpenModal(null)}
          onFound={(foundRow) => {
            saveMyId(foundRow.id);
            setMyRows((prev) => {
              const filtered = prev.filter((r) => r.id !== foundRow.id);
              return [foundRow, ...filtered];
            });
          }}
        />
      )}

      {openModal && typeof openModal === "object" && openModal.type === "edit" && (
        <EditAttendanceModal
          row={openModal.row}
          authName={openModal.authName}
          authPhone={openModal.authPhone}
          onClose={() => setOpenModal(null)}
          onSuccess={(updated) => {
            setMyRows((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          }}
        />
      )}

      {openModal &&
        typeof openModal === "object" &&
        openModal.type === "delete" && (
          <DeleteAttendanceModal
            row={openModal.row}
            authName={openModal.authName}
            authPhone={openModal.authPhone}
            onClose={() => setOpenModal(null)}
            onSuccess={(deletedId) => {
              setMyRows((prev) => prev.filter((r) => r.id !== deletedId));
              removeMyId(deletedId);
            }}
          />
        )}
    </section>
  );
}

/* ------------------------------------------------------------------
   공통 레이아웃
------------------------------------------------------------------ */
function AttendanceModalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="attendance-modal-content">
      <h2 className="modal-title">{title}</h2>
      {subtitle && <p className="modal-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   공용 UI: Toggle
------------------------------------------------------------------ */
function ToggleRow<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
  className?: string;
}) {
  return (
    <div className={`toggle-row ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`toggle-btn ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Write Modal (count 자동 1 제거 최종)
------------------------------------------------------------------ */
function WriteAttendanceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (row: AttendanceRow) => void;
}) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");

  const [side, setSide] = useState<Side | "">("");
  const [meal, setMeal] = useState<Meal | "">("");
  const [countInput, setCountInput] = useState(""); // ✅ 초기 빈칸

  const normalizeCountOnBlur = () => {
    // ✅ 빈칸이면 자동 입력하지 않음
    if (countInput.trim() === "") return;

    const n = parseInt(countInput, 10);
    if (!n || n < 1) return setCountInput("1"); // 이상 입력만 보정
    if (n > 10) return setCountInput("10");
    setCountInput(String(n));
  };

  return (
    <Modal onClose={onClose}>
      <AttendanceModalLayout title="참석 여부 확인하기">
        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const trimmedName = name.trim();
              const rawPhone = phoneDisplay.trim();
              const phone = normalizePhone(rawPhone);
              const countNum = parseInt(countInput, 10);

              // ✅ 빠진 항목 모아서 안내
              const missing: string[] = [];
              if (!trimmedName) missing.push("이름");
              if (!rawPhone) missing.push("연락처");
              if (!side) missing.push("하객 구분");
              if (!countNum || countNum < 1) missing.push("참석 인원");
              if (!meal) missing.push("식사 여부");

              if (missing.length > 0) {
                alert(`필수 항목을 입력/선택해주세요: ${missing.join(", ")}`);
                setLoading(false);
                return;
              }

              const safeCount = Math.max(1, Math.min(10, countNum));

              const { data, error } = await supabase
                .from("attendance")
                .insert([
                  { name: trimmedName, phone, count: safeCount, side, meal },
                ])
                .select("*")
                .single();

              if (error) throw error;

              alert("참석 여부가 등록되었습니다. 감사합니다!");
              onSuccess(data as AttendanceRow);
              onClose();
            } catch (err) {
              console.error(err);
              alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="field span-2">
            <label className="label">이름 *</label>
            <input
              disabled={loading}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field span-2">
            <label className="label">연락처 *</label>
            <input
              disabled={loading}
              type="tel"
              autoComplete="off"
              value={phoneDisplay}
              onChange={(e) => {
                const digits = normalizePhone(e.target.value);
                setPhoneDisplay(formatPhone(digits));
              }}
            />
          </div>

          <div className="field span-2">
            <label className="label">하객 구분 *</label>
            <ToggleRow
              value={side}
              onChange={setSide}
              options={[
                { label: "신랑 측", value: "groom" },
                { label: "신부 측", value: "bride" },
              ]}
            />
          </div>

          <div className="field span-2">
            <label className="label">참석 인원 *</label>
            <input
              disabled={loading}
              type="number"
              min={1}
              max={10}
              step={1}
              value={countInput}
              onChange={(e) => setCountInput(e.target.value)}
              onBlur={normalizeCountOnBlur}
            />
          </div>

          <div className="field span-2">
            <label className="label">식사 여부 *</label>
            <ToggleRow
              className="no-wrap"
              value={meal}
              onChange={setMeal}
              options={[
                { label: "O", value: "yes" },
                { label: "X", value: "no" },
                { label: "미정", value: "unknown" },
              ]}
            />
          </div>

          <div className="attendance-form__actions">
            <Button variant="submit" type="submit" disabled={loading}>
              저장하기
            </Button>
          </div>
        </form>
      </AttendanceModalLayout>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Find Modal (자동 하이픈 + 레거시 OR)
------------------------------------------------------------------ */
function FindAttendanceModal({
  onClose,
  onFound,
}: {
  onClose: () => void;
  onFound: (row: AttendanceRow) => void;
}) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");

  return (
    <Modal onClose={onClose}>
      <AttendanceModalLayout
        title="내 참석 응답 찾기"
        subtitle="제출했던 정보로 확인할 수 있어요."
      >
        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const trimmedName = name.trim();
              const rawPhone = phoneDisplay.trim();
              const phone = normalizePhone(rawPhone);

              if (!trimmedName || !rawPhone) {
                alert("이름과 연락처를 입력해주세요.");
                setLoading(false);
                return;
              }

              const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .eq("name", trimmedName)
                .or(`phone.eq.${rawPhone},phone.eq.${phone}`)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (error) throw error;
              if (!data) {
                alert("일치하는 응답을 찾지 못했습니다.");
                setLoading(false);
                return;
              }

              alert("내 응답을 찾았습니다.");
              onFound(data as AttendanceRow);
              onClose();
            } catch (err) {
              console.error(err);
              alert("찾기에 실패했습니다. 다시 시도해주세요.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="field span-2">
            <label className="label">이름 *</label>
            <input
              disabled={loading}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field span-2">
            <label className="label">연락처 *</label>
            <input
              disabled={loading}
              type="tel"
              autoComplete="off"
              value={phoneDisplay}
              onChange={(e) => {
                const digits = normalizePhone(e.target.value);
                setPhoneDisplay(formatPhone(digits));
              }}
            />
          </div>

          <div className="attendance-form__actions">
            <Button variant="submit" type="submit" disabled={loading}>
              찾기
            </Button>
          </div>
        </form>
      </AttendanceModalLayout>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Edit Modal (count 지우기 가능 + 레거시 OR)
------------------------------------------------------------------ */
function EditAttendanceModal({
  row,
  authName,
  authPhone,
  onClose,
  onSuccess,
}: {
  row: AttendanceRow;
  authName: string;
  authPhone: string;
  onClose: () => void;
  onSuccess: (row: AttendanceRow) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [meal, setMeal] = useState<Meal>(row.meal);
  const [countInput, setCountInput] = useState(String(row.count));

  const normalizeCountOnBlur = () => {
    if (countInput.trim() === "") return;

    const n = parseInt(countInput, 10);
    if (!n || n < 1) return setCountInput("1");
    if (n > 10) return setCountInput("10");
    setCountInput(String(n));
  };

  return (
    <Modal onClose={onClose}>
      <AttendanceModalLayout title="내 응답 수정">
        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const rawAuthPhone = authPhone;
              const normAuthPhone = normalizePhone(authPhone);

              const { data: check, error: checkError } = await supabase
                .from("attendance")
                .select("id")
                .eq("id", row.id)
                .eq("name", authName)
                .or(`phone.eq.${rawAuthPhone},phone.eq.${normAuthPhone}`)
                .maybeSingle();

              if (checkError || !check) {
                alert("본인 확인에 실패했습니다.");
                setLoading(false);
                return;
              }

              const countNum = parseInt(countInput, 10);
              if (!countNum || countNum < 1) {
                alert("참석 인원을 확인해주세요.");
                setLoading(false);
                return;
              }

              const safeCount = Math.max(1, Math.min(10, countNum));

              const { data, error } = await supabase
                .from("attendance")
                .update({ count: safeCount, meal })
                .eq("id", row.id)
                .select("*")
                .single();

              if (error) throw error;

              alert("수정되었습니다.");
              onSuccess(data as AttendanceRow);
              onClose();
            } catch (err) {
              console.error(err);
              alert("수정에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="field span-2">
            <label className="label">참석 인원 *</label>
            <input
              disabled={loading}
              type="number"
              min={1}
              max={10}
              step={1}
              value={countInput}
              onChange={(e) => setCountInput(e.target.value)}
              onBlur={normalizeCountOnBlur}
            />
          </div>

          <div className="field span-2">
            <label className="label">식사 여부 *</label>
            <ToggleRow
              className="no-wrap"
              value={meal}
              onChange={setMeal}
              options={[
                { label: "O", value: "yes" },
                { label: "X", value: "no" },
                { label: "미정", value: "unknown" },
              ]}
            />
          </div>

          <div className="attendance-form__actions">
            <Button variant="submit" type="submit" disabled={loading}>
              저장하기
            </Button>
          </div>
        </form>
      </AttendanceModalLayout>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Delete Modal (레거시 OR)
------------------------------------------------------------------ */
function DeleteAttendanceModal({
  row,
  authName,
  authPhone,
  onClose,
  onSuccess,
}: {
  row: AttendanceRow;
  authName: string;
  authPhone: string;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Modal onClose={onClose}>
      <AttendanceModalLayout
        title="내 응답 삭제"
        subtitle="삭제하면 복구할 수 없습니다."
      >
        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const rawAuthPhone = authPhone;
              const normAuthPhone = normalizePhone(authPhone);

              const { data: check, error: checkError } = await supabase
                .from("attendance")
                .select("id")
                .eq("id", row.id)
                .eq("name", authName)
                .or(`phone.eq.${rawAuthPhone},phone.eq.${normAuthPhone}`)
                .maybeSingle();

              if (checkError || !check) {
                alert("본인 확인에 실패했습니다.");
                setLoading(false);
                return;
              }

              const { error } = await supabase
                .from("attendance")
                .delete()
                .eq("id", row.id);

              if (error) throw error;

              alert("삭제되었습니다.");
              onSuccess(row.id);
              onClose();
            } catch (err) {
              console.error(err);
              alert("삭제에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="attendance-form__actions">
            <Button variant="submit" type="submit" disabled={loading}>
              삭제하기
            </Button>
          </div>
        </form>
      </AttendanceModalLayout>
    </Modal>
  );
}
