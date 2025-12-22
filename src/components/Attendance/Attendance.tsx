import { useEffect, useState, useMemo } from "react";
import "./Attendance.scss";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

/** --- Types & Utils --- */
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

type ModalType = null | "write" | "find" | { type: "edit" | "delete"; row: AttendanceRow };

const STORAGE_KEY = "attendance_ids";
const normalizePhone = (v: string) => v.replace(/\D/g, "");
const formatPhone = (digits: string) => {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

const mealLabel = (meal: Meal) =>
  meal === "yes" ? "식사 예정" : meal === "no" ? "식사 안 함" : "식사 미정";

/** --- Main Component --- */
export function Attendance() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [myRows, setMyRows] = useState<AttendanceRow[]>([]);

  const loadMyRows = async () => {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
    if (ids.length === 0) return;
    const { data } = await supabase.from("attendance").select("*").in("id", ids).order("created_at", { ascending: false });
    if (data) setMyRows(data as AttendanceRow[]);
  };

  useEffect(() => { loadMyRows(); }, []);

  const handleUpdateStorage = (id: number, action: "add" | "remove") => {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
    const next = action === "add" ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <section className="attendance">
      <div className="section-inner">
        <h2 className="section-title">참석 여부 확인</h2>
        <p className="attendance__desc">참석 여부를 미리 알려주시면 예식 준비에 큰 도움이 됩니다.</p>

        <div className="attendance-buttons">
          <Button variant="basic" onClick={() => setOpenModal("write")}>참석여부 확인하기</Button>
          {myRows.length === 0 && (
            <Button variant="basic" onClick={() => setOpenModal("find")}>내 응답 찾기</Button>
          )}
        </div>

        {myRows.length > 0 && (
          <div className="my-attendance">
            <h3 className="my-attendance__title">내 참석 응답</h3>
            {myRows.map((row) => (
              <div key={row.id} className="my-attendance__item">
                <div className="info">
                  <span className="name">{row.name}</span>
                  <span className="meta">
                    {row.side === "groom" ? "신랑 측" : "신부 측"} · {row.count}명 · {mealLabel(row.meal)}
                  </span>
                </div>
                <div className="actions">
                  <button onClick={() => setOpenModal({ type: "edit", row })} className="mini-btn">수정</button>
                  <button onClick={() => setOpenModal({ type: "delete", row })} className="mini-btn danger">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {openModal === "write" && (
        <WriteAttendanceModal
          onClose={() => setOpenModal(null)}
          onSuccess={(newRow) => {
            handleUpdateStorage(newRow.id, "add");
            setMyRows((prev) => [newRow, ...prev]);
          }}
        />
      )}
      {openModal === "find" && (
        <FindAttendanceModal
          onClose={() => setOpenModal(null)}
          onFound={(foundRow) => {
            handleUpdateStorage(foundRow.id, "add");
            setMyRows((prev) => [foundRow, ...prev.filter(r => r.id !== foundRow.id)]);
          }}
        />
      )}
      {typeof openModal === "object" && openModal?.type === "edit" && (
        <EditAttendanceModal
          row={openModal.row}
          onClose={() => setOpenModal(null)}
          onSuccess={(updated) => setMyRows(prev => prev.map(r => r.id === updated.id ? updated : r))}
        />
      )}
      {typeof openModal === "object" && openModal?.type === "delete" && (
        <DeleteAttendanceModal
          row={openModal.row}
          onClose={() => setOpenModal(null)}
          onSuccess={(id) => {
            setMyRows(prev => prev.filter(r => r.id !== id));
            handleUpdateStorage(id, "remove");
          }}
        />
      )}
    </section>
  );
}

/** --- Sub Components --- */
function ToggleRow<T extends string>({ value, onChange, options, noWrap }: { value: T | ""; onChange: (v: T) => void; options: { label: string; value: T }[]; noWrap?: boolean }) {
  return (
    <div className={`toggle-row ${noWrap ? "no-wrap" : ""}`}>
      {options.map((opt) => (
        <button key={opt.value} type="button" className={`toggle-btn ${value === opt.value ? "active" : ""}`} onClick={() => onChange(opt.value)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
