import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom"; // ✅ Portal 추가
import "./GuestBook.scss";

import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { supabase } from "@/supabaseClient";

const POSTS_PER_PAGE = 5;

type Post = {
  id: number;
  timestamp: number;
  name: string;
  content: string;
};

type ModalType = null | "write" | { type: "delete"; postId: number };

// ✅ 토스트 타입 정의
type ToastState = {
  msg: string;
  type: "success" | "error";
} | null;

// ✅ 핸들러 타입 정의
type ToastHandler = (msg: string, type: "success" | "error") => void;

const formatDate = (unixSeconds: number) => {
  const d = new Date(unixSeconds * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function GuestBook() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [openModal, setOpenModal] = useState<ModalType>(null);

  // ✅ [1] 토스트 상태 추가
  const [toast, setToast] = useState<ToastState>(null);

  // ✅ [2] 토스트 자동 닫힘 (2초)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ [3] 자식에게 내려줄 토스트 핸들러
  const handleToast: ToastHandler = (msg, type) => {
    setToast({ msg, type });
  };

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

  useEffect(() => { loadPage(0); }, []);

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
      <p className="guestbook__desc">
        신랑, 신부에게<br />축하의 마음을 전해주세요.
      </p>

      <div className="guestbook__actions top">
        <Button variant="basic" onClick={() => setOpenModal("write")}>
          방명록 작성하기
        </Button>
      </div>

      <div className="guestbook-list">
        {posts.length === 0 && (
          <div className="guestbook-empty">첫 번째 편지를 보내주세요 🕊️</div>
        )}

        {posts.map((post) => (
          <article key={post.id} className="guestbook-item">
            <button
              className="item-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                setOpenModal({ type: "delete", postId: post.id });
              }}
              type="button"
              aria-label="delete"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
            
            <div className="guestbook-item__head">
              <span className="name">{post.name}</span>
              <div className="date">
                <span>{formatDate(post.timestamp)}</span>
              </div>
            </div>
            
            <div className="divider">
              <i className="fa-solid fa-heart"></i>
            </div>
            
            <div className="guestbook-item__content">{post.content}</div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 0 && (
            <button className="page-nav" onClick={() => loadPage(currentPage - 1)} type="button" aria-label="이전 페이지">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          )}
          {pages.map((page) => (
            <button
              key={page}
              className={`page-num ${page === currentPage ? "current" : ""}`}
              onClick={() => loadPage(page)}
              type="button"
            >
              {page + 1}
            </button>
          ))}
          {currentPage < totalPages - 1 && (
            <button className="page-nav" onClick={() => loadPage(currentPage + 1)} type="button" aria-label="다음 페이지">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          )}
        </div>
      )}

      {/* ✅ 모달에 onToast 전달 */}
      {openModal === "write" && (
        <WriteGuestBookModal onClose={() => setOpenModal(null)} onSuccess={() => loadPage(0)} onToast={handleToast} />
      )}

      {openModal && typeof openModal === "object" && openModal.type === "delete" && (
        <DeleteGuestBookModal
          postId={openModal.postId}
          onClose={() => setOpenModal(null)}
          onSuccess={() => loadPage(currentPage)}
          onToast={handleToast}
        />
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

/* ------------------------------------------------------------------
   Write Modal (alert -> onToast)
------------------------------------------------------------------ */
function WriteGuestBookModal({ onClose, onSuccess, onToast }: { onClose: () => void; onSuccess: () => void; onToast: ToastHandler }) {
  const inputRef = useRef({}) as React.RefObject<{
    name: HTMLInputElement;
    content: HTMLTextAreaElement;
    password: HTMLInputElement;
  }>;
  const [loading, setLoading] = useState(false);

  return (
    <Modal
      onClose={onClose}
      footer={
        <div className="guestbook-footer-row">
          <Button variant="submit" type="submit" form="guestbook-write-form" disabled={loading}>저장하기</Button>
          <Button variant="close" type="button" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="guestbook-modal-content">
        <h2 className="modal-title">방명록 작성</h2>
        <form
          id="guestbook-write-form"
          className="guestbook-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const name = inputRef.current?.name.value.trim();
              const content = inputRef.current?.content.value.trim();
              const password = inputRef.current?.password.value;
              if (!name || !content || !password) {
                onToast("모든 항목을 입력해 주세요.", "error"); // ✅ Toast 사용
                setLoading(false);
                return;
              }
              const { error } = await supabase.from("guestbook").insert([{ name, content, password }]);
              if (error) throw error;
              
              onToast("방명록이 등록되었습니다", "success"); // ✅ Toast 사용
              onClose();
              onSuccess();
            } catch (err) {
              onToast("등록에 실패했습니다.", "error"); // ✅ Toast 사용
            } finally { setLoading(false); }
          }}
        >
          <div className="field">
            <label className="label">성함</label>
            <input disabled={loading} type="text" autoComplete="off" ref={(ref) => (inputRef.current!.name = ref as HTMLInputElement)} />
          </div>
          <div className="field">
            <label className="label">메시지</label>
            <textarea disabled={loading} ref={(ref) => (inputRef.current!.content = ref as HTMLTextAreaElement)} />
          </div>
          <div className="field">
            <label className="label">비밀번호</label>
            <input disabled={loading} type="password" ref={(ref) => (inputRef.current!.password = ref as HTMLInputElement)} />
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Delete Modal (alert -> onToast)
------------------------------------------------------------------ */
function DeleteGuestBookModal({ postId, onClose, onSuccess, onToast }: { postId: number; onClose: () => void; onSuccess: () => void; onToast: ToastHandler }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Modal
      onClose={onClose}
      footer={
        <div className="guestbook-footer-row">
          <Button variant="submit" type="submit" form="guestbook-delete-form" disabled={loading}>삭제하기</Button>
          <Button variant="close" type="button" onClick={onClose}>취소</Button>
        </div>
      }
    >
      <div className="guestbook-modal-content">
        <h2 className="modal-title">방명록 삭제</h2>
        <p className="modal-subtitle" style={{ textAlign: 'center', margin: '10px 0 20px', color: 'var(--text-main)', opacity: 0.8 }}>
          삭제를 위해 비밀번호를 입력해주세요.
        </p>
        <form
          id="guestbook-delete-form"
          className="guestbook-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const password = inputRef.current?.value ?? "";
              if (!password.trim()) {
                onToast("비밀번호를 입력해 주세요.", "error"); // ✅ Toast 사용
                setLoading(false);
                return;
              }
              // 1. 해당 글의 비밀번호 가져오기
              const { data, error } = await supabase.from("guestbook").select("password").eq("id", postId).single();
              if (error || !data) throw new Error();
              
              // 2. 비밀번호 비교
              if (String(data.password) !== String(password)) {
                onToast("비밀번호가 일치하지 않습니다.", "error"); // ✅ Toast 사용
                setLoading(false);
                return;
              }

              // 3. 삭제 요청
              const { error: deleteError } = await supabase.from("guestbook").delete().eq("id", postId);
              if (deleteError) throw deleteError;

              onToast("삭제되었습니다", "success"); // ✅ Toast 사용
              onClose();
              onSuccess();
            } catch (err) {
              onToast("삭제 중 오류가 발생했습니다.", "error"); // ✅ Toast 사용
            } finally { setLoading(false); }
          }}
        >
          <div className="field">
            <label className="label">비밀번호</label>
            <input ref={inputRef} disabled={loading} type="password" placeholder="비밀번호 입력" />
          </div>
        </form>
      </div>
    </Modal>
  );
}
