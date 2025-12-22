import { useEffect, useMemo, useRef, useState } from "react";
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
    <section className="guestbook">
      <h2 className="section-title">방명록</h2>
      <p className="guestbook__desc">
        신랑, 신부에게<br />축하의 마음을 전해주세요.
      </p>

      <div className="guestbook-list">
        {posts.length === 0 && (
          <div className="guestbook-empty">첫 편지의 주인공이 되어주세요 ✉️</div>
        )}

        {posts.map((post) => (
          <article key={post.id} className="guestbook-item">
            <div className="ticket-label">
              <i className="fa-solid fa-stamp"></i>
              <span>LOVE</span>
            </div>
            
            <div className="guestbook-item__head">
              <span className="name">{post.name}</span>
              <div className="date">
                <span>{formatDate(post.timestamp)}</span>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({ type: "delete", postId: post.id });
                }}
                type="button"
                aria-label="delete"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            
            <div className="divider">
              <i className="fa-solid fa-heart"></i>
            </div>
            
            <div className="guestbook-item__content">{post.content}</div>
          </article>
        ))}
      </div>

      {/* ✅ 페이지네이션: 유리구슬 스타일 최적화 (텍스트 제거, 아이콘만 사용) */}
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

      <div className="guestbook__actions">
        <Button variant="basic" onClick={() => setOpenModal("write")}>
          <i className="fa-solid fa-pen-nib"></i> 방명록 작성하기
        </Button>
      </div>

      {openModal === "write" && (
        <WriteGuestBookModal onClose={() => setOpenModal(null)} onSuccess={() => loadPage(0)} />
      )}

      {openModal && typeof openModal === "object" && openModal.type === "delete" && (
        <DeleteGuestBookModal
          postId={openModal.postId}
          onClose={() => setOpenModal(null)}
          onSuccess={() => loadPage(currentPage)}
        />
      )}
    </section>
  );
}

// Write/Delete 모달 컴포넌트는 기존 로직 유지 (생략)
