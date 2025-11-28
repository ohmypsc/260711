import { useEffect, useRef, useState } from "react";
import "./Attendance.scss";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

type Side = "groom" | "bride";
type Meal = "yes" | "no" | "unknown";

type AttendanceRow = {
  id: number;
  name: string;
  phone: string;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, id]));
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
            setMyRows([foundRow]);
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

      {openModal && typeof openModal === "object" && openModal.type === "delete" && (
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
   공용 UI: Toggle Buttons / Stepper
------------------------------------------------------------------ */

function ToggleRow<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="toggle-row">
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

function CountStepper({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="count-stepper">
      <button
        type="button"
        className="step-btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
      >
        −
      </button>

      <div className="count-pill">{value}명</div>

      <button
        type="button"
        className="step-btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------
   Write Modal (select 제거 / 2열 구성)
------------------------------------------------------------------ */

function WriteAttendanceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (row: AttendanceRow) => void;
}) {
  const [loading, setLoading] = useState(false);

  const [side, setSide] = useState<Side | "">("");
  const [meal, setMeal] = useState<Meal | "">("");
  const [count, setCount] = useState(1);

  const ref = useRef({
    name: null as unknown as HTMLInputElement,
    phone: null as unknown as HTMLInputElement,
  });

  return (
    <Modal onClose={onClose}>
      <div className="attendance-modal-content">
        <h2 className="modal-title">참석 여부 확인하기</h2>
        <p className="modal-subtitle">간단히 입력해 주시면 큰 도움이 됩니다.</p>

        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const name = ref.current.name.value.trim();
              const phone = ref.current.phone.value.trim();

              if (!name || !phone || !side) {
                alert("이름, 연락처, 하객 구분은 필수입니다.");
                return;
              }
              if (!meal) {
                alert("식사 여부를 선택해주세요.");
                return;
              }

              const { data, error } = await supabase
                .from("attendance")
                .insert([{ name, phone, count, side, meal }])
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
              placeholder="이름을 입력해주세요."
              ref={(r) => (ref.current.name = r as HTMLInputElement)}
            />
          </div>

          <div className="field span-2">
            <label className="label">연락처 *</label>
            <input
              disabled={loading}
              type="tel"
              placeholder="010-0000-0000"
              ref={(r) => (ref.current.phone = r as HTMLInputElement)}
            />
          </div>

          <div className="field">
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

          <div className="field">
            <label className="label">참석 인원 *</label>
            <CountStepper value={count} onChange={setCount} />
          </div>

          <div className="field span-2">
            <label className="label">식사 여부 *</label>
            <ToggleRow
              value={meal}
              onChange={setMeal}
              options={[
                { label: "예정입니다", value: "yes" },
                { label: "예정이 아닙니다", value: "no" },
                { label: "미정입니다", value: "unknown" },
              ]}
            />
          </div>

          <div className="attendance-form__actions">
            <Button variant="submit" type="submit" disabled={loading}>
              저장하기
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Find Modal (컴팩트/전역 헤더)
------------------------------------------------------------------ */

function FindAttendanceModal({
  onClose,
  onFound,
}: {
  onClose: () => void;
  onFound: (row: AttendanceRow) => void;
}) {
  const [loading, setLoading] = useState(false);
  const ref = useRef({
    name: null as unknown as HTMLInputElement,
    phone: null as unknown as HTMLInputElement,
  });

  return (
    <Modal onClose={onClose}>
      <div className="attendance-modal-content">
        <h2 className="modal-title">내 참석 응답 찾기</h2>
        <p className="modal-subtitle">제출했던 정보로 확인할 수 있어요.</p>

        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const name = ref.current.name.value.trim();
              const phone = ref.current.phone.value.trim();

              if (!name || !phone) {
                alert("이름과 연락처를 입력해주세요.");
                return;
              }

              const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .eq("name", name)
                .eq("phone", phone)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (error) throw error;
              if (!data) {
                alert("일치하는 응답을 찾지 못했습니다.");
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
              placeholder="이름을 입력해주세요."
              ref={(r) => (ref.current.name = r as HTMLInputElement)}
            />
          </div>

          <div className="field span-2">
            <label className="label">연락처 *</label>
            <input
              disabled={loading}
              type="tel"
              placeholder="제출할 때 입력한 연락처"
              ref={(r) => (ref.current.phone = r as HTMLInputElement)}
            />
          </div>

          <div className="attendance-form__actions">
            <Button variant="submit" type="submit" disabled={loading}>
              찾기
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Edit / Delete Modals (select 제거 / 최소 UI)
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
  const [count, setCount] = useState(row.count);
  const [meal, setMeal] = useState<Meal>(row.meal);

  return (
    <Modal onClose={onClose}>
      <div className="attendance-modal-content">
        <h2 className="modal-title">내 응답 수정</h2>

        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const { data: check, error: checkError } = await supabase
                .from("attendance")
                .select("id")
                .eq("id", row.id)
                .eq("name", authName)
                .eq("phone", authPhone)
                .maybeSingle();

              if (checkError || !check) {
                alert("본인 확인에 실패했습니다.");
                return;
              }

              const { data, error } = await supabase
                .from("attendance")
                .update({ count, meal })
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
          <div className="field">
            <label className="label">참석 인원 *</label>
            <CountStepper value={count} onChange={setCount} />
          </div>

          <div className="field span-2">
            <label className="label">식사 여부 *</label>
            <ToggleRow
              value={meal}
              onChange={setMeal}
              options={[
                { label: "예정입니다", value: "yes" },
                { label: "예정이 아닙니다", value: "no" },
                { label: "미정입니다", value: "unknown" },
              ]}
            />
          </div>

          <div className="attendance-form__actions">
            <Button variant="outline" type="submit" disabled={loading}>
              저장하기
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

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
      <div className="attendance-modal-content">
        <h2 className="modal-title">내 응답 삭제</h2>
        <p className="modal-subtitle">삭제하면 복구할 수 없습니다.</p>

        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const { data: check, error: checkError } = await supabase
                .from("attendance")
                .select("id")
                .eq("id", row.id)
                .eq("name", authName)
                .eq("phone", authPhone)
                .maybeSingle();

              if (checkError || !check) {
                alert("본인 확인에 실패했습니다.");
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
      </div>
    </Modal>
  );
}
