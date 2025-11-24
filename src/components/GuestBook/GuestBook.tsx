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

// ✅ dayjs 없이 날짜 포맷
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

  useEffect(() => {
    loadPage(0);
  }, []);

  // ✅ 실시간 반영
  useEffect(() => {
    const sub = supabase
      .channel("guestbook-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook" },
        () => loadPage(currentPage)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "guestbook" },
        () => loadPage(currentPage)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [currentPage]);

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i),
    [totalPages]
  );

  return (
    <section className="guestbook">
      <h2 className="section-title">방명록</h2>
      <p className="guestbook__desc">
        신랑, 신부에게 축하의 마음을 전해주세요.
      </p>

      {/* 작성 버튼 */}
      <div className="guestbook__actions">
        <Button variant="outline" onClick={() => setOpenModal("write")}>
          방명록 작성하기
        </Button>
      </div>

      {/* 목록 */}
      <div className="guestbook-list">
        {posts.length === 0 && (
          <div className="guestbook-empty">
            아직 작성된 방명록이 없습니다.
          </div>
        )}

        {posts.map((post) => (
          <article key={post.id} className="guestbook-item">
            <div className="guestbook-item__head">
              <div className="guestbook-item__meta">
                <span className="name">{post.name}</span>
                <span className="date">{formatDate(post.timestamp)}</span>
              </div>

              <button
                className="delete-btn"
                onClick={() =>
                  setOpenModal({ type: "delete", postId: post.id })
                }
                aria-label="delete"
              >
                삭제
              </button>
            </div>

            <div className="guestbook-item__content">{post.content}</div>
          </article>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 0 && (
            <button
              className="page"
              onClick={() => loadPage(currentPage - 1)}
            >
              이전
            </button>
          )}

          {pages.map((page) => (
            <button
              key={page}
              className={`page ${page === currentPage ? "current" : ""}`}
              onClick={() => loadPage(page)}
            >
              {page + 1}
            </button>
          ))}

          {currentPage < totalPages - 1 && (
            <button
              className="page"
              onClick={() => loadPage(currentPage + 1)}
            >
              다음
            </button>
          )}
        </div>
      )}

      {/* 작성 모달 */}
      {openModal === "write" && (
        <WriteGuestBookModal
          onClose={() => setOpenModal(null)}
          onSuccess={() => loadPage(0)}
        />
      )}

      {/* 삭제 모달 */}
      {openModal &&
        typeof openModal === "object" &&
        openModal.type === "delete" && (
          <DeleteGuestBookModal
            postId={openModal.postId}
            onClose={() => setOpenModal(null)}
            onSuccess={() => loadPage(currentPage)}
          />
        )}
    </section>
  );
}

/* ------------------------------------------------------------------
   Write Modal
------------------------------------------------------------------ */

function WriteGuestBookModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const inputRef = useRef({}) as React.RefObject<{
    name: HTMLInputElement;
    content: HTMLTextAreaElement;
    password: HTMLInputElement;
  }>;

  const [loading, setLoading] = useState(false);

  return (
    <Modal onClose={onClose}>
      <div className="guestbook-modal-content">
        <h2 className="modal-heading modal-divider">방명록 작성하기</h2>

        <form
          className="guestbook-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const name = inputRef.current.name.value.trim();
              const content = inputRef.current.content.value.trim();
              const password = inputRef.current.password.value;

              if (!name || !content || !password) {
                alert("모든 항목을 입력해주세요.");
                return;
              }

              const { error } = await supabase
                .from("guestbook")
                .insert([{ name, content, password }]);

              if (error) throw error;

              alert("방명록이 등록되었습니다.");
              onClose();
              onSuccess();
            } catch (err) {
              console.error(err);
              alert("방명록 작성에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="label">이름</label>
          <input
            disabled={loading}
            type="text"
            placeholder="이름을 입력해주세요."
            ref={(ref) => (inputRef.current.name = ref as HTMLInputElement)}
          />

          <label className="label">내용</label>
          <textarea
            disabled={loading}
            placeholder="축하 메시지를 입력해주세요."
            ref={(ref) =>
              (inputRef.current.content = ref as HTMLTextAreaElement)
            }
          />

          <label className="label">비밀번호</label>
          <input
            disabled={loading}
            type="password"
            placeholder="비밀번호를 입력해주세요."
            ref={(ref) =>
              (inputRef.current.password = ref as HTMLInputElement)
            }
          />

          <div className="guestbook-form__actions">
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
   Delete Modal
------------------------------------------------------------------ */

function DeleteGuestBookModal({
  postId,
  onClose,
  onSuccess,
}: {
  postId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  return (
    <Modal onClose={onClose}>
      <div className="guestbook-modal-content">
        <h2 className="modal-heading modal-divider">삭제하시겠습니까?</h2>

        <form
          className="guestbook-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const password = inputRef.current?.value ?? "";

              const { data, error } = await supabase
                .from("guestbook")
                .select("password")
                .eq("id", postId)
                .single();

              if (error || !data) {
                alert("삭제 오류가 발생했습니다.");
                return;
              }

              if (data.password !== password) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
              }

              const { error: deleteError } = await supabase
                .from("guestbook")
                .delete()
                .eq("id", postId);

              if (deleteError) throw deleteError;

              alert("삭제되었습니다.");
              onClose();
              onSuccess();
            } catch (err) {
              console.error(err);
              alert("삭제에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="label">비밀번호</label>
          <input
            ref={inputRef}
            disabled={loading}
            type="password"
            placeholder="비밀번호를 입력해주세요."
          />

          <div className="guestbook-form__actions">
            <Button variant="outline" type="submit" disabled={loading}>
              삭제하기
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
