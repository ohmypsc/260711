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

type ModalType = null | "write" | { type: "delete"; postId: number };
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

  const loadPage = async (page = 0) => {
    const offset = page * POSTS_PER_PAGE;
    try {
      const { data, count, error } = await supabase
        .from("guestbook")
        .select("id, name, content, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (error) throw error;

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

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i), [totalPages]);

  return (
    <div className="guestbook-wrapper">
      <h2 className="section-title">방명록</h2>
      <p className="guestbook__desc">신랑, 신부에게<br />축하의 마음을 전해주세요.</p>

      <div className="guestbook__actions top">
        <Button variant="basic" onClick={() => setOpenModal("write")}>방명록 남기기</Button>
      </div>

      <div className={`guestbook-list ${posts.length === 0 ? 'is-empty' : ''}`}>
        {posts.length === 0 ? (
          <div className="guestbook-empty">첫 번째 편지를 보내주세요 🕊️</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="guestbook-item" data-style={post.id % 6}>
              <button className="item-delete-btn" onClick={() => setOpenModal({ type: "delete", postId: post.id })}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              <div className="guestbook-item__head">
                <span className="name">{post.name}</span>
                <span className="date">{formatDate(post.timestamp)}</span>
              </div>
              <div className="guestbook-item__content">{post.content}</div>
            </article>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-nav" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {pages.map((page) => (
            <button key={page} className={`page-num ${page === currentPage ? "current" : ""}`} onClick={() => setCurrentPage(page)}>
              {page + 1}
            </button>
          ))}
          <button className="page-nav" disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {openModal === "write" && <WriteGuestBookModal onClose={() => setOpenModal(null)} onSuccess={() => loadPage(0)} onToast={handleToast} />}
      {openModal && typeof openModal === "object" && openModal.type === "delete" && (
        <DeleteGuestBookModal postId={openModal.postId} onClose={() => setOpenModal(null)} onSuccess={() => loadPage(currentPage)} onToast={handleToast} />
      )}
      {toast && createPortal(<div className="custom-toast"><i className={toast.type === "success" ? "fa-solid fa-check" : "fa-solid fa-circle-exclamation"}></i>{toast.msg}</div>, document.body)}
    </div>
  );
}

/* 📋 Write/Delete Modal (Placeholder 제거 버전) */
function WriteGuestBookModal({ onClose, onSuccess, onToast }: any) {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { name, content, password } = Object.fromEntries(formData) as any;
    if (!name || !content || !password) return onToast("모든 항목을 입력해 주세요", "error");
    try {
      const { error } = await supabase.from("guestbook").insert([{ name, content, password }]);
      if (error) throw error;
      onToast("방명록이 등록되었습니다", "success");
      onSuccess(); onClose();
    } catch { onToast("등록에 실패했습니다", "error"); }
  };
  return (
    <Modal onClose={onClose} footer={<div className="guestbook-footer-row"><Button variant="submit" type="submit" form="write-form">저장하기</Button><Button variant="close" onClick={onClose}>닫기</Button></div>}>
      <form id="write-form" className="guestbook-form" onSubmit={handleSubmit}>
        <div className="field"><label className="label">성함</label><input name="name" type="text" autoComplete="off" /></div>
        <div className="field"><label className="label">메시지</label><textarea name="content" /></div>
        <div className="field"><label className="label">비밀번호</label><input name="password" type="password" autoComplete="new-password" /></div>
      </form>
    </Modal>
  );
}

function DeleteGuestBookModal({ postId, onClose, onSuccess, onToast }: any) {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password");
    try {
      const { data } = await supabase.from("guestbook").select("password").eq("id", postId).single();
      if (data?.password !== password) return onToast("비밀번호 불일치", "error");
      await supabase.from("guestbook").delete().eq("id", postId);
      onToast("삭제되었습니다", "success");
      onSuccess(); onClose();
    } catch { onToast("오류 발생", "error"); }
  };
  return (
    <Modal onClose={onClose} footer={<div className="guestbook-footer-row"><Button variant="submit" type="submit" form="del-form">삭제하기</Button><Button variant="close" onClick={onClose}>취소</Button></div>}>
      <form id="del-form" className="guestbook-form" onSubmit={handleSubmit}>
        <div className="field"><label className="label">비밀번호</label><input name="password" type="password" /></div>
      </form>
    </Modal>
  );
}
