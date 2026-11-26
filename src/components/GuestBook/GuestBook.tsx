import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./GuestBook.scss";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

const POSTS_PER_PAGE = 6;

type Post = {
  id: number;
  timestamp: number;
  name: string;
  content: string;
};

type ModalType = null | "write";
type ToastState = { msg: string; type: "success" | "error" } | null;
type ToastHandler = (msg: string, type: "success" | "error") => void;

const formatDate = (unixSeconds: number) => {
  const d = new Date(unixSeconds * 1000);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

export function GuestBook() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToast: ToastHandler = (msg, type) => setToast({ msg, type });

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const loadPage = async (page = 0) => {
    const offset = page * POSTS_PER_PAGE;
    try {
      const { data, count, error } = await supabase
        .from("guestbook")
        .select("id, name, content, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (error) throw error;

      if (page > 0 && data && data.length === 0) {
        setCurrentPage(page - 1);
        return;
      }

      const formatted = (data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        content: item.content,
        timestamp: Math.floor(new Date(item.created_at).getTime() / 1000),
      }));

      setPosts(formatted);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadPage(currentPage); }, [currentPage]);

  useEffect(() => {
    const sub = supabase
      .channel("guestbook-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook" }, () => loadPage(currentPage))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "guestbook" }, () => loadPage(currentPage))
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [currentPage]);

  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i), [totalPages]);

  return (
    <div className="guestbook-wrapper">
      <h2 className="section-title">방명록</h2>
      <div className="section-desc">
  <p>신랑, 신부에게</p>
  <p>축하의 마음을 전해주세요.</p>
</div>
      <div className="guestbook__actions top">
        <Button variant="basic" onClick={() => setOpenModal("write")}>방명록 남기기</Button>
      </div>

      <div className={`guestbook-list ${posts.length === 0 ? 'is-empty' : ''}`}>
        {posts.length === 0 ? (
          <div className="guestbook-empty">첫 번째 편지를 보내주세요 🕊️</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="guestbook-item" data-style={post.id % 6}>
              <div className="guestbook-item__head">
                <span className="name">{post.name}</span>
                <div className="date"><span>{formatDate(post.timestamp)}</span></div>
              </div>
              <div className="guestbook-item__content">{post.content}</div>
            </article>
          ))
        )}
      </div>

      {/* ✅ 페이지네이션: 브라우저 기본 스타일 방지를 위해 button을 span으로 수정 */}
      {totalPages > 1 && (
        <div className="pagination">
          <span 
            className={`page-nav ${currentPage === 0 ? "disabled" : ""}`} 
            onClick={() => currentPage !== 0 && setCurrentPage(p => p - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </span>
          {pages.map((page) => (
            <span 
              key={page} 
              className={`page-num ${page === currentPage ? "current" : ""}`} 
              onClick={() => setCurrentPage(page)}
            >
              {page + 1}
            </span>
          ))}
          <span 
            className={`page-nav ${currentPage === totalPages - 1 ? "disabled" : ""}`} 
            onClick={() => currentPage !== totalPages - 1 && setCurrentPage(p => p + 1)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </span>
        </div>
      )}

      {openModal === "write" && <WriteGuestBookModal onClose={() => setOpenModal(null)} onSuccess={() => loadPage(0)} onToast={handleToast} />}
      {toast && createPortal(<div className="custom-toast"><i className={toast.type === "success" ? "fa-solid fa-check" : "fa-solid fa-circle-exclamation"}></i>{toast.msg}</div>, document.body)}
    </div>
  );
}

function WriteGuestBookModal({ onClose, onSuccess, onToast }: { onClose: () => void; onSuccess: () => void; onToast: ToastHandler }) {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const content = (formData.get("content") as string).trim();
    if (!name || !content) return onToast("모든 항목을 입력해 주세요", "error");
    setLoading(true);
    try {
      // 비밀번호는 더 이상 받지 않음 (기존 컬럼 호환용 빈 값)
      const { error } = await supabase.from("guestbook").insert([{ name, content, password: "" }]);
      if (error) throw error;
      onToast("방명록이 등록되었습니다", "success");
      onSuccess(); onClose();
    } catch { onToast("등록에 실패했습니다", "error"); } finally { setLoading(false); }
  };
  return (
    <Modal onClose={onClose} footer={<div className="guestbook-footer-row"><Button variant="submit" type="submit" form="write-form" disabled={loading}>저장하기</Button><Button variant="close" onClick={onClose}>닫기</Button></div>}>
      <div className="guestbook-modal-content">
        <h2 className="modal-title">방명록 작성</h2>
        <form id="write-form" className="guestbook-form" onSubmit={handleSubmit}>
          <div className="field"><label className="label">성함</label><input name="name" disabled={loading} type="text" autoComplete="off" /></div>
          <div className="field"><label className="label">메시지</label><textarea name="content" disabled={loading} /></div>
        </form>
      </div>
    </Modal>
  );
}
