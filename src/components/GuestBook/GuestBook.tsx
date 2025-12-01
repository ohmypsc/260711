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

type ModalType =
  | null
  | "write"
  | { type: "delete"; post: Post }
  | { type: "edit"; post: Post };

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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "guestbook" },
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

      <div className="guestbook__actions">
        <Button variant="basic" onClick={() => setOpenModal("write")}>
          방명록 작성하기
        </Button>
      </div>

      <div className="guestbook-list">
        {posts.length === 0 && (
          <div className="guestbook-empty">첫 방명록을 작성해 주세요 💖</div>
        )}

        {posts.map((post) => (
          <article key={post.id} className="guestbook-item">
            <div className="guestbook-item__head">
              <div className="guestbook-item__meta">
                <span className="name">{post.name}</span>
                <span className="date">{formatDate(post.timestamp)}</span>
              </div>

              {/* ✅ B안: 항상 노출 */}
              <div className="guestbook-item__actions">
                <button
                  className="mini-btn"
                  onClick={() => setOpenModal({ type: "edit", post })}
                  type="button"
                >
                  수정
                </button>
                <button
                  className="mini-btn danger"
                  onClick={() => setOpenModal({ type: "delete", post })}
                  type="button"
                  aria-label="delete"
                >
                  삭제
                </button>
              </div>
            </div>

            <div className="guestbook-item__content">{post.content}</div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 0 && (
            <button className="page" onClick={() => loadPage(currentPage - 1)}>
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
            <button className="page" onClick={() => loadPage(currentPage + 1)}>
              다음
            </button>
          )}
        </div>
      )}

      {openModal === "write" && (
        <WriteGuestBookModal
          onClose={() => setOpenModal(null)}
          onSuccess={() => loadPage(0)}
        />
      )}

      {openModal && typeof openModal === "object" && openModal.type === "delete" && (
        <DeleteGuestBookModal
          post={openModal.post}
          onClose={() => setOpenModal(null)}
          onSuccess={() => loadPage(currentPage)}
        />
      )}

      {openModal && typeof openModal === "object" && openModal.type === "edit" && (
        <EditGuestBookModal
          post={openModal.post}
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
    <Modal
      onClose={onClose}
      footer={
        <div className="guestbook-footer-row">
          <Button
            variant="submit"
            type="submit"
            form="guestbook-write-form"
            disabled={loading}
          >
            저장하기
          </Button>
          <Button variant="close" type="button" onClick={onClose}>
            닫기
          </Button>
        </div>
      }
    >
      <div className="guestbook-modal-content">
        <h2 className="modal-title">방명록 작성하기</h2>

        <form
          id="guestbook-write-form"
          className="guestbook-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const name = inputRef.current.name.value.trim();
              const content = inputRef.current.content.value.trim();
              const password = inputRef.current.password.value;

              const missing: string[] = [];
              if (!name) missing.push("이름");
              if (!content) missing.push("내용");
              if (!password) missing.push("비밀번호");

              if (missing.length) {
                alert(`필수 항목을 입력해주세요: ${missing.join(", ")}`);
                setLoading(false);
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
          <label className="label">이름 *</label>
          <input
            disabled={loading}
            type="text"
            autoComplete="off"
            placeholder="이름을 입력해주세요."
            ref={(ref) => (inputRef.current.name = ref as HTMLInputElement)}
          />

          <label className="label">내용 *</label>
          <textarea
            disabled={loading}
            placeholder="축하 메시지를 입력해주세요."
            ref={(ref) =>
              (inputRef.current.content = ref as HTMLTextAreaElement)
            }
          />

          <label className="label">비밀번호 *</label>
          <input
            disabled={loading}
            type="password"
            autoComplete="off"
            placeholder="삭제/수정 시 필요해요."
            ref={(ref) =>
              (inputRef.current.password = ref as HTMLInputElement)
            }
          />
        </form>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Edit Modal (B안: 항상 노출 + 비번 인증)
------------------------------------------------------------------ */
function EditGuestBookModal({
  post,
  onClose,
  onSuccess,
}: {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(post.name);
  const [content, setContent] = useState(post.content);
  const [password, setPassword] = useState("");

  return (
    <Modal
      onClose={onClose}
      footer={
        <div className="guestbook-footer-row">
          <Button
            variant="submit"
            type="submit"
            form="guestbook-edit-form"
            disabled={loading}
          >
            저장하기
          </Button>
          <Button variant="close" type="button" onClick={onClose}>
            닫기
          </Button>
        </div>
      }
    >
      <div className="guestbook-modal-content">
        <h2 className="modal-title">방명록 수정</h2>

        <form
          id="guestbook-edit-form"
          className="guestbook-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const trimmedName = name.trim();
              const trimmedContent = content.trim();

              const missing: string[] = [];
              if (!trimmedName) missing.push("이름");
              if (!trimmedContent) missing.push("내용");
              if (!password) missing.push("비밀번호");

              if (missing.length) {
                alert(`필수 항목을 입력해주세요: ${missing.join(", ")}`);
                setLoading(false);
                return;
              }

              // ✅ 비번 확인
              const { data, error } = await supabase
                .from("guestbook")
                .select("password")
                .eq("id", post.id)
                .single();

              if (error || !data) {
                alert("수정 오류가 발생했습니다.");
                setLoading(false);
                return;
              }

              if (data.password !== password) {
                alert("비밀번호가 일치하지 않습니다.");
                setLoading(false);
                return;
              }

              const { error: updateError } = await supabase
                .from("guestbook")
                .update({ name: trimmedName, content: trimmedContent })
                .eq("id", post.id);

              if (updateError) throw updateError;

              alert("수정되었습니다.");
              onClose();
              onSuccess();
            } catch (err) {
              console.error(err);
              alert("수정에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="label">이름 *</label>
          <input
            disabled={loading}
            type="text"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="label">내용 *</label>
          <textarea
            disabled={loading}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className="label">비밀번호 *</label>
          <input
            disabled={loading}
            type="password"
            autoComplete="off"
            placeholder="작성 시 입력한 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </form>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------
   Delete Modal (B안: 항상 노출 + 비번 인증)
------------------------------------------------------------------ */
function DeleteGuestBookModal({
  post,
  onClose,
  onSuccess,
}: {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <Modal
      onClose={onClose}
      footer={
        <div className="guestbook-footer-row">
          <Button
            variant="submit"
            type="submit"
            form="guestbook-delete-form"
            disabled={loading}
          >
            삭제하기
          </Button>
          <Button variant="close" type="button" onClick={onClose}>
            닫기
          </Button>
        </div>
      }
    >
      <div className="guestbook-modal-content">
        <h2 className="modal-title">삭제하시겠습니까?</h2>

        <form
          id="guestbook-delete-form"
          className="guestbook-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              if (!password) {
                alert("비밀번호를 입력해주세요.");
                setLoading(false);
                return;
              }

              const { data, error } = await supabase
                .from("guestbook")
                .select("password")
                .eq("id", post.id)
                .single();

              if (error || !data) {
                alert("삭제 오류가 발생했습니다.");
                setLoading(false);
                return;
              }

              if (data.password !== password) {
                alert("비밀번호가 일치하지 않습니다.");
                setLoading(false);
                return;
              }

              const { error: deleteError } = await supabase
                .from("guestbook")
                .delete()
                .eq("id", post.id);

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
          <label className="label">비밀번호 *</label>
          <input
            disabled={loading}
            type="password"
            autoComplete="off"
            placeholder="작성 시 입력한 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </form>
      </div>
    </Modal>
  );
}
