import { useEffect, useState, useCallback } from "react";
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

const normalizePhone = (v: string) => v.replace(/\D/g, "");
const formatPhone = (digits: string) => {
  const d = digits.slice(0, 11);
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

const mealLabel = (meal: Meal) => {
  const labels = { yes: "식사 예정", no: "식사 안 함", unknown: "식사 미정" };
  return labels[meal];
};

const useAttendanceIds = () => {
  const getIds = useCallback(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[], []);
  const addId = (id: number) => {
    const next = Array.from(new Set([...getIds(), id]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const removeId = (id: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getIds().filter((x) => x !== id)));
  };
  return { getIds, addId, removeId };
};

export function Attendance() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [myRows, setMyRows] = useState<AttendanceRow[]>([]);
  const { getIds, addId, removeId } = useAttendanceIds();

  const loadMyRows = async () => {
    const ids = getIds();
    if (ids.length === 0) return;
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });
    if (!error && data) setMyRows(data as AttendanceRow[]);
  };

  useEffect(() => { loadMyRows(); }, []);

  const handleWriteSuccess = (newRow: AttendanceRow) => {
    addId(newRow.id);
    setMyRows((prev) => [newRow, ...prev.filter(r => r.id !== newRow.id)]);
  };

  return (
    <section className="attendance">
      <h2 className="section-title">참석 여부 전달</h2>

      <p className="attendance__desc keep-all">
        소중한 걸음을 해주시는 분들을 위해<br />
        정성껏 예식을 준비하고자 합니다.<br />
        참석 여부를 편히 알려주시면 감사하겠습니다.
      </p>

      <div className="attendance-buttons">
        <Button variant="basic" onClick={() => setOpenModal("write")}>참석 의사 전달하기</Button>
        {myRows.length === 0 && (
          <Button variant="basic" onClick={() => setOpenModal("find")}>내 응답 찾기</Button>
        )}
      </div>

      {myRows.length > 0 && (
        <div className="my-attendance">
          <h3 className="my-attendance__title">보내주신 참석 응답</h3>
          <div className="attendance-list">
            {myRows.map((row) => (
              <div key={row.id} className="attendance-card">
                <div className="card-top">
                  <span className={`side-badge ${row.side}`}>
                    {row.side === "groom" ? "신랑 측" : "신부 측"}
                  </span>
                </div>
                <div className="card-content">
                  <div className="name-row">
                    <span className="name">{row.name}</span><span className="suffix">님</span>
                  </div>
                  <div className="meta-container">
                    <div className="meta-pill"><i className="fa-solid fa-users"></i> <span>{row.count}명</span></div>
                    <div className="meta-pill"><i className="fa-solid fa-utensils"></i> <span>{mealLabel(row.meal)}</span></div>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="actions">
                  <button className="action-btn" onClick={() => setOpenModal({ type: "edit", row, authName: row.name, authPhone: row.phone })}>
                    <i className="fa-solid fa-pen-to-square"></i> <span>수정</span>
                  </button>
                  <button className="action-btn danger" onClick={() => setOpenModal({ type: "delete", row, authName: row.name, authPhone: row.phone })}>
                    <i className="fa-solid fa-trash-can"></i> <span>삭제</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {openModal === "write" && <WriteAttendanceModal onClose={() => setOpenModal(null)} onSuccess={handleWriteSuccess} />}
      {openModal === "find" && <FindAttendanceModal onClose={() => setOpenModal(null)} onFound={handleWriteSuccess} />}
      {typeof openModal === "object" && openModal?.type === "edit" && (
        <EditAttendanceModal row={openModal.row} authName={openModal.authName} authPhone={openModal.authPhone} onClose={() => setOpenModal(null)} onSuccess={(updated) => setMyRows(prev => prev.map(r => r.id === updated.id ? updated : r))} />
      )}
      {typeof openModal === "object" && openModal?.type === "delete" && (
        <DeleteAttendanceModal row={openModal.row} authName={openModal.authName} authPhone={openModal.authPhone} onClose={() => setOpenModal(null)} onSuccess={(id) => { setMyRows(prev => prev.filter(r => r.id !== id)); removeId(id); }} />
      )}
    </section>
  );
}

/* Modal 컴포넌트들 (Write, Find, Edit, Delete) 생략... 위에서 작성한 최신 로직 유지 */
