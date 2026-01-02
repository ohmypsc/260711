import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom"; // ✅ Portal 추가
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

// ✅ 토스트 타입 정의
type ToastState = {
  msg: string;
  type: "success" | "error";
} | null;

// ✅ 모달들이 공통으로 받을 Toast 함수 타입
type ToastHandler = (msg: string, type: "success" | "error") => void;

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
  const labels = { yes: "식사할 예정", no: "식사 안 함", unknown: "식사 여부 미정" };
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

  // ✅ [1] 토스트 상태 추가
  const [toast, setToast] = useState<ToastState>(null);

  // ✅ [2] 토스트 자동 닫힘 (2초)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ [3] 하위 모달에 전달할 토스트 핸들러
  const handleToast: ToastHandler = (msg, type) => {
    setToast({ msg, type });
  };

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
    <div className="attendance-wrapper">
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
                    <div className="meta-pill">
                      <i className="fa-solid fa-users"></i> <span>{row.count}명</span>
                    </div>
                    <div className="meta-pill">
                      <i className="fa-solid fa-utensils"></i> <span>{mealLabel(row.meal)}</span>
                    </div>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="actions">
                  <button type="button" className="action-btn" onClick={() => setOpenModal({ type: "edit", row, authName: row.name, authPhone: row.phone })}>
                    <i className="fa-solid fa-pen-to-square"></i> <span>수정</span>
                  </button>
                  <button type="button" className="action-btn danger" onClick={() => setOpenModal({ type: "delete", row, authName: row.name, authPhone: row.phone })}>
                    <i className="fa-solid fa-trash-can"></i> <span>삭제</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ 모달들에 onToast 전달 */}
      {openModal === "write" && <WriteAttendanceModal onClose={() => setOpenModal(null)} onSuccess={handleWriteSuccess} onToast={handleToast} />}
      {openModal === "find" && <FindAttendanceModal onClose={() => setOpenModal(null)} onFound={handleWriteSuccess} onToast={handleToast} />}
      {typeof openModal === "object" && openModal?.type === "edit" && (
        <EditAttendanceModal row={openModal.row} authName={openModal.authName} authPhone={openModal.authPhone} onClose={() => setOpenModal(null)} onSuccess={(updated) => setMyRows(prev => prev.map(r => r.id === updated.id ? updated : r))} onToast={handleToast} />
      )}
      {typeof openModal === "object" && openModal?.type === "delete" && (
        <DeleteAttendanceModal row={openModal.row} authName={openModal.authName} authPhone={openModal.authPhone} onClose={() => setOpenModal(null)} onSuccess={(id) => { setMyRows(prev => prev.filter(r => r.id !== id)); removeId(id); }} onToast={handleToast} />
      )}

      {/* ✅ [4] Portal로 토스트 렌더링 */}
      {toast && createPortal(
        <div className="custom-toast">
          <i className={toast.type === "success" ? "fa-solid fa-check" : "fa-solid fa-circle-exclamation"}></i>
          {toast.msg}
        </div>,
        document.body
      )}
    </div>
  );
}

function Counter({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="counter-ui">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="count-value">{value}명</span>
      <button type="button" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

// ✅ 각 모달에서 alert 대신 onToast 사용
function WriteAttendanceModal({ onClose, onSuccess, onToast }: { onClose: () => void; onSuccess: (row: AttendanceRow) => void; onToast: ToastHandler }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", side: "" as Side | "", meal: "" as Meal | "", count: 1 });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.side || !form.meal) return onToast("모든 항목을 입력해 주세요.", "error");
    setLoading(true);
    try {
      const { data, error } = await supabase.from("attendance").insert([{ ...form, phone: normalizePhone(form.phone) }]).select("*").single();
      if (error) throw error;
      
      onToast("저장되었습니다", "success");
      onSuccess(data as AttendanceRow);
      onClose();
    } catch (err) { onToast("등록에 실패했습니다.", "error"); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} footer={
      <div className="attendance-footer-row">
        <Button variant="submit" type="submit" form="write-form" disabled={loading}>전달하기</Button>
        <Button variant="close" onClick={onClose}>닫기</Button>
      </div>
    }>
      {/* ... 기존 JSX 그대로 ... */}
      <div className="attendance-modal-content">
        <h2 className="modal-title">참석 의사 전달</h2>
        <form id="write-form" className="attendance-form" onSubmit={onSubmit}>
          <div className="field span-2">
            <label className="label">구분</label>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${form.side === "groom" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "groom" })}>신랑 측</button>
              <button type="button" className={`toggle-btn ${form.side === "bride" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "bride" })}>신부 측</button>
            </div>
          </div>
          <div className="field span-2">
            <label className="label">성함</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field span-2">
            <label className="label">연락처</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(normalizePhone(e.target.value)) })} />
          </div>
          <div className="field span-2">
            <label className="label">참석 인원</label>
            <Counter value={form.count} onChange={v => setForm({ ...form, count: v })} />
          </div>
          <div className="field span-2">
            <label className="label">식사 여부</label>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${form.meal === "yes" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "yes" })}>O</button>
              <button type="button" className={`toggle-btn ${form.meal === "no" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "no" })}>X</button>
              <button type="button" className={`toggle-btn ${form.meal === "unknown" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "unknown" })}>미정</button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function FindAttendanceModal({ onClose, onFound, onToast }: { onClose: () => void; onFound: (row: AttendanceRow) => void; onToast: ToastHandler }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const onFind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return onToast("모든 항목을 입력해 주세요.", "error");
    setLoading(true);
    try {
      const normPhone = normalizePhone(phone);
      const { data, error } = await supabase.from("attendance").select("*").eq("name", name.trim()).or(`phone.eq.${phone},phone.eq.${normPhone}`).maybeSingle();
      if (error) throw error;
      if (!data) return onToast("일치하는 응답을 찾을 수 없습니다.", "error");
      
      onToast("응답을 확인했습니다", "success");
      onFound(data as AttendanceRow);
      onClose();
    } catch (err) { onToast("찾기에 실패했습니다.", "error"); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} footer={
      <div className="attendance-footer-row">
        <Button variant="submit" type="submit" form="find-form" disabled={loading}>찾기</Button>
        <Button variant="close" onClick={onClose}>닫기</Button>
      </div>
    }>
      {/* ... 기존 JSX 그대로 ... */}
      <div className="attendance-modal-content">
        <h2 className="modal-title">내 응답 찾기</h2>
        <form id="find-form" className="attendance-form" onSubmit={onFind}>
          <div className="field span-2">
            <label className="label">성함</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field span-2">
            <label className="label">연락처</label>
            <input type="tel" value={phone} onChange={e => setPhone(formatPhone(normalizePhone(e.target.value)))} />
          </div>
        </form>
      </div>
    </Modal>
  );
}

function EditAttendanceModal({ row, authName, authPhone, onClose, onSuccess, onToast }: { row: AttendanceRow; authName: string; authPhone: string; onClose: () => void; onSuccess: (row: AttendanceRow) => void; onToast: ToastHandler }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...row, phone: formatPhone(row.phone) });

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.side || !form.meal) return onToast("모든 항목을 입력해 주세요.", "error");
    setLoading(true);
    try {
      const { data, error } = await supabase.from("attendance").update({ ...form, phone: normalizePhone(form.phone) }).eq("id", row.id).select("*").single();
      if (error) throw error;
      
      onToast("수정되었습니다", "success");
      onSuccess(data as AttendanceRow);
      onClose();
    } catch (err) { onToast("수정에 실패했습니다.", "error"); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} footer={
      <div className="attendance-footer-row">
        <Button variant="submit" type="submit" form="edit-form" disabled={loading}>수정하기</Button>
        <Button variant="close" onClick={onClose}>닫기</Button>
      </div>
    }>
      {/* ... 기존 JSX 그대로 ... */}
      <div className="attendance-modal-content">
        <h2 className="modal-title">내 응답 수정</h2>
        <form id="edit-form" className="attendance-form" onSubmit={onUpdate}>
          <div className="field span-2">
            <label className="label">구분</label>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${form.side === "groom" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "groom" })}>신랑 측</button>
              <button type="button" className={`toggle-btn ${form.side === "bride" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "bride" })}>신부 측</button>
            </div>
          </div>
          <div className="field span-2">
            <label className="label">성함</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field span-2">
            <label className="label">연락처</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(normalizePhone(e.target.value)) })} />
          </div>
          <div className="field span-2">
            <label className="label">참석 인원</label>
            <Counter value={form.count} onChange={v => setForm({ ...form, count: v })} />
          </div>
          <div className="field span-2">
            <label className="label">식사 여부</label>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${form.meal === "yes" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "yes" })}>O</button>
              <button type="button" className={`toggle-btn ${form.meal === "no" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "no" })}>X</button>
              <button type="button" className={`toggle-btn ${form.meal === "unknown" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "unknown" })}>미정</button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function DeleteAttendanceModal({ row, authName, authPhone, onClose, onSuccess, onToast }: { row: AttendanceRow; authName: string; authPhone: string; onClose: () => void; onSuccess: (id: number) => void; onToast: ToastHandler }) {
  const [loading, setLoading] = useState(false);
  const onDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("attendance").delete().eq("id", row.id);
      if (error) throw error;
      
      onToast("삭제되었습니다", "success");
      onSuccess(row.id);
      onClose();
    } catch (err) { onToast("삭제에 실패했습니다.", "error"); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} footer={
      <div className="attendance-footer-row">
        <Button variant="submit" onClick={onDelete} disabled={loading}>삭제하기</Button>
        <Button variant="close" onClick={onClose}>취소</Button>
      </div>
    }>
      <div className="attendance-modal-content">
        <h2 className="modal-title">응답 삭제</h2>
        <p className="modal-subtitle keep-all" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-main)' }}>
          참석 응답을 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.
        </p>
      </div>
    </Modal>
  );
}
