import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/common/Button/Button"
import { useModal } from "@/components/common/Modal/Modal"
import { supabase } from "@/supabaseClient"
import "./guestbook.scss"

const POSTS_PER_PAGE = 5

type Post = {
  id: number
  timestamp: number
  name: string
  content: string
}

export const GuestBook = () => {
  const { openModal, closeModal } = useModal()
  const [posts, setPosts] = useState<Post[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  // 🔹 페이지별 글 불러오기
  const loadPage = async (page = 0) => {
    const offset = page * POSTS_PER_PAGE
    try {
      const { data, count, error } = await supabase
        .from("guestbook")
        .select("id, name, content, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1)

      if (error) throw error

      const formatted = (data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        content: item.content,
        timestamp: Math.floor(new Date(item.created_at).getTime() / 1000),
      }))

      setPosts(formatted)
      setTotalCount(count || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading posts:", error)
    }
  }

  // 🔹 초기 로드
  useEffect(() => {
    loadPage(0)
  }, [])

  // 🔹 실시간 갱신
  useEffect(() => {
    const subscription = supabase
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
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentPage])

  // 🔹 페이지 버튼 계산
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i)
  }, [totalPages])

  return (
    <LazyDiv className="card guestbook">
      <h2>방명록</h2>
      <div className="break" />

      {/* 게시글 목록 */}
      {posts.map((post) => (
        <div key={post.id} className="post">
          <div className="heading">
            <button
              className="close-button"
              onClick={() =>
                openModal({
                  className: "delete-guestbook-modal",
                  closeOnClickBackground: false,
                  header: <div className="title">삭제하시겠습니까?</div>,
                  content: (
                    <DeleteGuestBookModal
                      postId={post.id}
                      onSuccess={() => loadPage(currentPage)}
                    />
                  ),
                  footer: (
                    <>
                      <Button
                        buttonStyle="style2"
                        type="submit"
                        form="guestbook-delete-form"
                      >
                        삭제하기
                      </Button>
                      <Button
                        buttonStyle="style2"
                        className="bg-light-grey-color text-dark-color"
                        onClick={closeModal}
                      >
                        닫기
                      </Button>
                    </>
                  ),
                })
              }
            />
          </div>

          <div className="body">
            <div className="title">
              <div className="name">{post.name}</div>
              <div className="date">
                {dayjs.unix(post.timestamp).format("YYYY-MM-DD")}
              </div>
            </div>
            <div className="content">{post.content}</div>
          </div>
        </div>
      ))}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 0 && (
            <div className="page" onClick={() => loadPage(currentPage - 1)}>
              이전
            </div>
          )}

          {pages.map((page) => (
            <div
              key={page}
              className={`page${page === currentPage ? " current" : ""}`}
              onClick={() => loadPage(page)}
            >
              {page + 1}
            </div>
          ))}

          {currentPage < totalPages - 1 && (
            <div className="page" onClick={() => loadPage(currentPage + 1)}>
              다음
            </div>
          )}
        </div>
      )}

      <div className="break" />

      {/* 작성 버튼 */}
      <Button
        onClick={() =>
          openModal({
            className: "write-guestbook-modal",
            closeOnClickBackground: false,
            header: (
              <div className="title-group">
                <div className="title">방명록 작성하기</div>
                <div className="subtitle">
                  신랑, 신부에게 축하의 마음을 전해주세요.
                </div>
              </div>
            ),
            content: <WriteGuestBookModal loadPosts={() => loadPage(0)} />,
            footer: (
              <>
                <Button
                  buttonStyle="style2"
                  type="submit"
                  form="guestbook-write-form"
                >
                  저장하기
                </Button>
                <Button
                  buttonStyle="style2"
                  className="bg-light-grey-color text-dark-color"
                  onClick={closeModal}
                >
                  닫기
                </Button>
              </>
            ),
          })
        }
      >
        방명록 작성하기
      </Button>
    </LazyDiv>
  )
}

// ==========================
// ✏️ 작성 모달
// ==========================
const WriteGuestBookModal = ({ loadPosts }: { loadPosts: () => void }) => {
  const inputRef = useRef({}) as React.RefObject<{
    name: HTMLInputElement
    content: HTMLTextAreaElement
    password: HTMLInputElement
  }>
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)

  return (
    <form
      id="guestbook-write-form"
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
          const name = inputRef.current.name.value.trim()
          const content = inputRef.current.content.value.trim()
          const password = inputRef.current.password.value

          if (!name || !content || !password) {
            alert("모든 항목을 입력해주세요.")
            return
          }

          const { error } = await supabase
            .from("guestbook")
            .insert([{ name, content, password }])

          if (error) throw error

          alert("방명록이 등록되었습니다.")
          closeModal()
          loadPosts()
        } catch (err) {
          console.error(err)
          alert("방명록 작성에 실패했습니다.")
        } finally {
          setLoading(false)
        }
      }}
    >
      이름
      <input
        disabled={loading}
        type="text"
        placeholder="이름을 입력해주세요."
        ref={(ref) => (inputRef.current.name = ref as HTMLInputElement)}
      />

      내용
      <textarea
        disabled={loading}
        placeholder="축하 메시지를 입력해주세요."
        ref={(ref) => (inputRef.current.content = ref as HTMLTextAreaElement)}
      />

      비밀번호
      <input
        disabled={loading}
        type="password"
        placeholder="비밀번호를 입력해주세요."
        ref={(ref) => (inputRef.current.password = ref as HTMLInputElement)}
      />
    </form>
  )
}

// ==========================
// 🗑️ 삭제 모달
// ==========================
const DeleteGuestBookModal = ({
  postId,
  onSuccess,
}: {
  postId: number
  onSuccess: () => void
}) => {
  const inputRef = useRef({} as HTMLInputElement)
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)

  return (
    <form
      id="guestbook-delete-form"
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
          const password = inputRef.current.value

          const { data, error } = await supabase
            .from("guestbook")
            .select("password")
            .eq("id", postId)
            .single()

          if (error || !data) {
            alert("삭제 오류가 발생했습니다.")
            return
          }

          if (data.password !== password) {
            alert("비밀번호가 일치하지 않습니다.")
            return
          }

          const { error: deleteError } = await supabase
            .from("guestbook")
            .delete()
            .eq("id", postId)

          if (deleteError) throw deleteError

          alert("삭제되었습니다.")
          closeModal()
          onSuccess()
        } catch (err) {
          console.error(err)
          alert("삭제에 실패했습니다.")
        } finally {
          setLoading(false)
        }
      }}
    >
      <input
        disabled={loading}
        type="password"
        placeholder="비밀번호를 입력해주세요."
        className="password"
        ref={inputRef}
      />
    </form>
  )
}
