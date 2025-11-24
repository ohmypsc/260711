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

  // ✅ 같은 브라우저에서 제출했던 id 자동 로드
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
        <Button variant="outline" onClick={() => setOpenModal("write")}>
          참석여부 확인하기
        </Button>

        {!hasMyRows && (
          <Button variant="outline" onClick={() => setOpenModal("find")}>
            내 응답 찾기
          </Button>
        )}
      </div>

      {/* ✅ 내 응답 표시 */}
      {hasMyRows && (
        <div className="my-attendance">
          <h3 className="my-attendance__title">내 참석 응답</h3>

          {myRows.map((row) => (
            <div key={row.id} className="my-attendance__item">
              <div className="line">
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

      {/* 작성 모달 */}
      {openModal === "write" && (
        <WriteAttendanceModal
          onClose={() => setOpenModal(null)}
          onSuccess={(newRow) => {
            saveMyId(newRow.id);
            setMyRows((prev) => [newRow, ...prev]);
          }}
        />
      )}

      {/* 내 응답 찾기 모달 */}
      {openModal === "find" && (
        <FindAttendanceModal
          onClose={() => setOpenModal(null)}
          onFound={(foundRow) => {
            saveMyId(foundRow.id);
            setMyRows([foundRow]);
          }}
        />
      )}

      {/* 수정 모달 */}
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

      {/* 삭제 모달 */}
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
   Write Modal (message 제거)
------------------------------------------------------------------ */

function WriteAttendanceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (row: AttendanceRow) => void;
}) {
  const [loading, setLoading] = useState(false);

  const ref = useRef({
    name: null as unknown as HTMLInputElement,
    phone: null as unknown as HTMLInputElement,
    count: null as unknown as HTMLSelectElement,
    side: null as unknown as HTMLSelectElement,
    meal: null as unknown as HTMLSelectElement,
  });

  return (
    <Modal onClose={onClose}>
      <div className="attendance-modal-content">
        <h2 className="modal-heading modal-divider">참석 여부 확인하기</h2>

        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const name = ref.current.name.value.trim();
              const phone = ref.current.phone.value.trim();
              const count = parseInt(ref.current.count.value, 10);
              const side = ref.current.side.value as Side;
              const meal = ref.current.meal.value as Meal;

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
          <label className="label">이름 *</label>
          <input
            disabled={loading}
            type="text"
            placeholder="이름을 입력해주세요."
            ref={(r) => (ref.current.name = r as HTMLInputElement)}
          />

          <label className="label">연락처 *</label>
          <input
            disabled={loading}
            type="tel"
            placeholder="010-0000-0000"
            ref={(r) => (ref.current.phone = r as HTMLInputElement)}
          />

          <label className="label">어느 분의 하객이신가요? *</label>
          <select
            disabled={loading}
            ref={(r) => (ref.current.side = r as HTMLSelectElement)}
            defaultValue=""
          >
            <option value="" disabled>
              선택해주세요
            </option>
            <option value="groom">신랑 측</option>
            <option value="bride">신부 측</option>
          </select>

          <label className="label">참석 인원 *</label>
          <select
            disabled={loading}
            ref={(r) => (ref.current.count = r as HTMLSelectElement)}
            defaultValue="1"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}명
              </option>
            ))}
          </select>

          <label className="label">식사 여부 *</label>
          <select
            disabled={loading}
            ref={(r) => (ref.current.meal = r as HTMLSelectElement)}
            defaultValue=""
          >
            <option value="" disabled>
              선택해주세요
            </option>
            <option value="yes">예정입니다</option>
            <option value="no">예정이 아닙니다</option>
            <option value="unknown">미정입니다</option>
          </select>

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

/* ------------------------------------------------------------------
   Find Modal
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
        <h2 className="modal-heading modal-divider">내 참석 응답 찾기</h2>

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
          <label className="label">이름 *</label>
          <input
            disabled={loading}
            type="text"
            placeholder="이름을 입력해주세요."
            ref={(r) => (ref.current.name = r as HTMLInputElement)}
          />

          <label className="label">연락처 *</label>
          <input
            disabled={loading}
            type="tel"
            placeholder="제출할 때 입력한 연락처"
            ref={(r) => (ref.current.phone = r as HTMLInputElement)}
          />

          <div className="attendance-form__actions">
            <Button variant="outline" type="submit" disabled={loading}>
              찾기
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Edit / Delete Modals (message 제거)
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
  const ref = useRef({
    count: null as unknown as HTMLSelectElement,
    meal: null as unknown as HTMLSelectElement,
  });

  return (
    <Modal onClose={onClose}>
      <div className="attendance-modal-content">
        <h2 className="modal-heading modal-divider">내 응답 수정</h2>

        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              // ✅ 최종 1회 본인 확인
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

              const count = parseInt(ref.current.count.value, 10);
              const meal = ref.current.meal.value as Meal;

              if (!meal) {
                alert("식사 여부를 선택해주세요.");
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
          <label className="label">참석 인원 *</label>
          <select
            disabled={loading}
            ref={(r) => (ref.current.count = r as HTMLSelectElement)}
            defaultValue={String(row.count)}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}명
              </option>
            ))}
          </select>

          <label className="label">식사 여부 *</label>
          <select
            disabled={loading}
            ref={(r) => (ref.current.meal = r as HTMLSelectElement)}
            defaultValue={row.meal}
          >
            <option value="yes">예정입니다</option>
            <option value="no">예정이 아닙니다</option>
            <option value="unknown">미정입니다</option>
          </select>

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
        <h2 className="modal-heading modal-divider">내 응답 삭제</h2>

        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              // ✅ 최종 1회 본인 확인
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
            <Button variant="outline" type="submit" disabled={loading}>
              삭제하기
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
