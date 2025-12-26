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
  const labels = { yes: "식사 예정", no: "식사 안 함", unknown: "미정" };
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
      <div className="section-inner">
        <h2 className="section-title">참석 여부 전달</h2>

        <div className="attendance__desc">
          <p className="keep-all">소중한 걸음을 해주시는 분들을 위해</p>
          <p className="keep-all">정성껏 예식을 준비하고자 합니다.</p>
          <p className="keep-all">참석 여부를 알려주시면 큰 도움이 됩니다.</p>
        </div>

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
                    <div className="name-area">
                      <span className="name">{row.name}</span>
                      <span className="suffix">님</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="meta-pill">
                      <i className="fa-solid fa-users"></i>
                      <span>{row.count}명</span>
                    </div>
                    <div className="meta-pill">
                      <i className="fa-solid fa-utensils"></i>
                      <span>{mealLabel(row.meal)}</span>
                    </div>
                  </div>

                  <div className="divider"></div>
                  
                  <div className="actions">
                    <button 
                      type="button" 
                      className="action-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenModal({ type: "edit", row, authName: row.name, authPhone: row.phone });
                      }}
                    >
                      <i className="fa-solid fa-pen"></i> 수정
                    </button>
                    <button 
                      type="button" 
                      className="action-btn danger" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenModal({ type: "delete", row, authName: row.name, authPhone: row.phone });
                      }}
                    >
                      <i className="fa-solid fa-trash"></i> 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="find-more-wrap">
               <button type="button" className="find-more-btn" onClick={() => setOpenModal("find")}>
                 다른 응답 찾기
               </button>
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
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Sub Components
// ------------------------------------------------------------------

function Counter({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="counter-ui">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="counter-btn minus">
        <i className="fa-solid fa-minus"></i>
      </button>
      <span className="count-value">{value}명</span>
      <button type="button" onClick={() => onChange(value + 1)} className="counter-btn plus">
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );
}

function WriteAttendanceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (row: AttendanceRow) => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", side: "" as Side | "", meal: "" as Meal | "", count: 1 });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.side || !form.meal) return alert("모든 항목을 입력해 주세요.");
    setLoading(true);
    try {
      const { data, error } = await supabase.from("attendance").insert([{ ...form, phone: normalizePhone(form.phone) }]).select("*").single();
      if (error) throw error;
      alert("참석 정보가 전달되었습니다.");
      onSuccess(data as AttendanceRow);
      onClose();
    } catch (err) { alert("등록에 실패했습니다."); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} footer={
      <div className="attendance-footer-row">
        <Button variant="submit" type="submit" form="write-form" disabled={loading}>전달하기</Button>
        <Button variant="close" onClick={onClose}>취소</Button>
      </div>
    }>
      <div className="attendance-modal-content">
        <h2 className="modal-title">참석 의사 전달</h2>
        <p className="modal-subtitle">축하해 주시는 마음, 정성껏 준비하겠습니다.</p>
        
        <form id="write-form" className="attendance-form" onSubmit={onSubmit}>
          {/* 1. 구분: span-2 (한 줄 꽉 채움) */}
          <div className="field span-2">
            <label className="label">구분</label>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${form.side === "groom" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "groom" })}>신랑 측</button>
              <button type="button" className={`toggle-btn ${form.side === "bride" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "bride" })}>신부 측</button>
            </div>
          </div>

          {/* 2. ✅ 성함 & 인원: 나란히 배치 (span-2 제거) */}
          <div className="field">
            <label className="label">성함</label>
            <input placeholder="성함을 입력해 주세요" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">인원</label>
            <Counter value={form.count} onChange={v => setForm({ ...form, count: v })} />
          </div>

          {/* 3. 연락처: span-2 (한 줄 꽉 채움) */}
          <div className="field span-2">
            <label className="label">연락처</label>
            <input type="tel" placeholder="010-0000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(normalizePhone(e.target.value)) })} />
          </div>
          
          {/* 4. 식사 여부: span-2 (한 줄 꽉 채움) */}
          <div className="field span-2">
            <label className="label">식사 여부</label>
            <div className="toggle-row three-cols">
              <button type="button" className={`toggle-btn ${form.meal === "yes" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "yes" })}>식사 예정</button>
              <button type="button" className={`toggle-btn ${form.meal === "no" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "no" })}>식사 안 함</button>
              <button type="button" className={`toggle-btn ${form.meal === "unknown" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "unknown" })}>미정</button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function FindAttendanceModal({ onClose, onFound }: { onClose: () => void; onFound: (row: AttendanceRow) => void }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const onFind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return alert("모든 항목을 입력해 주세요.");
    setLoading(true);
    try {
      const normPhone = normalizePhone(phone);
      const { data, error } = await supabase.from("attendance").select("*").eq("name", name.trim()).or(`phone.eq.${phone},phone.eq.${normPhone}`).maybeSingle();
      if (error) throw error;
      if (!data) return alert("일치하는 응답을 찾을 수 없습니다.");
      alert("응답을 확인했습니다.");
      onFound(data as AttendanceRow);
      onClose();
    } catch (err) { alert("찾기에 실패했습니다."); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} footer={
      <div className="attendance-footer-row">
        <Button variant="submit" type="submit" form="find-form" disabled={loading}>조회하기</Button>
        <Button variant="close" onClick={onClose}>취소</Button>
      </div>
    }>
      <div className="attendance-modal-content">
        <h2 className="modal-title">내 응답 찾기</h2>
        <p className="modal-subtitle">작성 시 입력한 성함과 연락처를 입력해 주세요.</p>
        
        <form id="find-form" className="attendance-form" onSubmit={onFind}>
          <div className="field span-2">
            <label className="label">성함</label>
            <input placeholder="성함" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field span-2">
            <label className="label">연락처</label>
            <input type="tel" placeholder="연락처" value={phone} onChange={e => setPhone(formatPhone(normalizePhone(e.target.value)))} />
          </div>
        </form>
      </div>
    </Modal>
  );
}

function EditAttendanceModal({ row, authName, authPhone, onClose, onSuccess }: { row: AttendanceRow; authName: string; authPhone: string; onClose: () => void; onSuccess: (row: AttendanceRow) => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...row, phone: formatPhone(row.phone) });

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.side || !form.meal) return alert("모든 항목을 입력해 주세요.");
    setLoading(true);
    try {
      const { data, error } = await supabase.from("attendance").update({ ...form, phone: normalizePhone(form.phone) }).eq("id", row.id).select("*").single();
      if (error) throw error;
      alert("수정되었습니다.");
      onSuccess(data as AttendanceRow);
      onClose();
    } catch (err) { alert("수정에 실패했습니다."); } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} footer={
      <div className="attendance-footer-row">
        <Button variant="submit" type="submit" form="edit-form" disabled={loading}>수정완료</Button>
        <Button variant="close" onClick={onClose}>취소</Button>
      </div>
    }>
      <div className="attendance-modal-content">
        <h2 className="modal-title">내 응답 수정</h2>
        <p className="modal-subtitle">변경하실 내용을 입력해 주세요.</p>
        
        <form id="edit-form" className="attendance-form" onSubmit={onUpdate}>
          {/* 1. 구분 */}
          <div className="field span-2">
            <label className="label">구분</label>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${form.side === "groom" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "groom" })}>신랑 측</button>
              <button type="button" className={`toggle-btn ${form.side === "bride" ? "active" : ""}`} onClick={() => setForm({ ...form, side: "bride" })}>신부 측</button>
            </div>
          </div>

          {/* 2. ✅ 성함 & 인원: 나란히 배치 */}
          <div className="field">
            <label className="label">성함</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">인원</label>
            <Counter value={form.count} onChange={v => setForm({ ...form, count: v })} />
          </div>

          {/* 3. 연락처 */}
          <div className="field span-2">
            <label className="label">연락처</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(normalizePhone(e.target.value)) })} />
          </div>
          
          {/* 4. 식사 여부 */}
          <div className="field span-2">
            <label className="label">식사 여부</label>
            <div className="toggle-row three-cols">
              <button type="button" className={`toggle-btn ${form.meal === "yes" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "yes" })}>식사 예정</button>
              <button type="button" className={`toggle-btn ${form.meal === "no" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "no" })}>식사 안 함</button>
              <button type="button" className={`toggle-btn ${form.meal === "unknown" ? "active" : ""}`} onClick={() => setForm({ ...form, meal: "unknown" })}>미정</button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function DeleteAttendanceModal({ row, authName, authPhone, onClose, onSuccess }: { row: AttendanceRow; authName: string; authPhone: string; onClose: () => void; onSuccess: (id: number) => void }) {
  const [loading, setLoading] = useState(false);
  const onDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("attendance").delete().eq("id", row.id);
      if (error) throw error;
      alert("삭제되었습니다.");
      onSuccess(row.id);
      onClose();
    } catch (err) { alert("삭제에 실패했습니다."); } finally { setLoading(false); }
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
        <p className="modal-subtitle">
          정말 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.
        </p>
      </div>
    </Modal>
  );
}
