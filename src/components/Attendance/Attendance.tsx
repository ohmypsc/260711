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
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
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

    if (!error && data) setMyRows(data as AttendanceRow[]);
  };

  useEffect(() => { loadMyRows(); }, []);

  const saveMyId = (id: number) => {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set([...prev, id]))));
  };

  const removeMyId = (id: number) => {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev.filter((x) => x !== id)));
  };

  return (
    <section className="attendance">
      <div className="section-inner">
        <h2 className="section-title">참석 소식 전하기</h2>

        <div className="attendance__desc">
          <p className="keep-all">소중한 분들을 모시는 자리에 귀한 발걸음 해주시는 마음 깊이 감사드립니다.</p>
          <p className="keep-all">보내주시는 참석 소식은 예식을 더 정성껏 준비하는 데에 큰 도움이 됩니다.</p>
          <p className="keep-all">번거로우시겠지만 미리 알려주시면 세심히 준비하도록 하겠습니다.</p>
        </div>

        <div className="attendance-buttons">
          <Button variant="basic" onClick={() => setOpenModal("write")}>
            참석 여부 전달하기
          </Button>

          {!hasMyRows && (
            <Button variant="basic" onClick={() => setOpenModal("find")}>
              내 응답 확인하기
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
                    {row.side === "groom" ? "신랑 측" : "신부 측"} · {row.count}명 · {mealLabel(row.meal)}
                  </span>
                </div>
                <div className="actions">
                  <button onClick={() => setOpenModal({ type: "edit", row, authName: row.name, authPhone: row.phone })} className="mini-btn">수정</button>
                  <button onClick={() => setOpenModal({ type: "delete", row, authName: row.name, authPhone: row.phone })} className="mini-btn danger">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 모달 렌더링 부분 (기존과 동일하므로 구조 유지) */}
      {openModal === "write" && (
        <WriteAttendanceModal
          onClose={() => setOpenModal(null)}
          onSuccess={(newRow) => { saveMyId(newRow.id); setMyRows((prev) => [newRow, ...prev]); }}
        />
      )}
      {openModal === "find" && (
        <FindAttendanceModal
          onClose={() => setOpenModal(null)}
          onFound={(foundRow) => { saveMyId(foundRow.id); setMyRows((prev) => [foundRow, ...prev.filter(r => r.id !== foundRow.id)]); }}
        />
      )}
      {/* ... Edit/Delete Modal 조건부 렌더링 로직 생략 (기존 코드와 동일) ... */}
    </section>
  );
}

// 하단 ModalLayout, ToggleRow 등 서브 컴포넌트 생략 (기존 로직 유지)
