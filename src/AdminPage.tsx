import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [guestbook, setGuestbook] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]); // ✅ 추가

  const ADMIN_PASSWORD = "20260711"; // 다시 변경 가능

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const loadData = async () => {
    const { data: guestbookData } = await supabase
      .from("guestbook")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: galleryData } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    setGuestbook(guestbookData || []);
    setAttendance(attendanceData || []);
    setPhotos(galleryData || []); // ✅ 사진 저장
  };

  // 사진 삭제 (관리자)
  const deletePhoto = async (id: string) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await supabase.from("gallery").delete().eq("id", id);
    loadData();
  };

  if (!authenticated) {
    return (
      <div style={styles.center}>
        <div style={styles.loginCard}>
          <h2 style={{ marginBottom: 20 }}>관리자 로그인</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💒 관리자 페이지</h1>

      {/* 📖 방명록 */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>📖 방명록 목록</h2>
        <div style={styles.cardList}>
          {guestbook.length === 0 ? (
            <p style={styles.empty}>아직 작성된 방명록이 없습니다.</p>
          ) : (
            guestbook.map((g) => (
              <div key={g.id} style={styles.card}>
                <h3 style={styles.name}>🧡 {g.name}</h3>
                <p style={styles.content}>{g.content}</p>
                <p style={styles.date}>
                  🕒 {new Date(g.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 💌 참석 의사 */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>💌 참석 의사 목록</h2>
        <div style={styles.cardList}>
          {attendance.length === 0 ? (
            <p style={styles.empty}>아직 참석 의사가 없습니다.</p>
          ) : (
            attendance.map((a) => (
              <div key={a.id} style={styles.card}>
                <h3 style={styles.name}>
                  🎉 {a.name} ({a.side === "groom" ? "신랑 측" : "신부 측"})
                </h3>
                <p>🍽 식사: {mealText(a.meal)}</p>
                <p>👥 인원: {a.count}명</p>
                <p style={styles.date}>
                  🕒 {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 🖼 하객 사진 업로드 목록 */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>🖼 하객 사진 목록</h2>
        {photos.length === 0 ? (
          <p style={styles.empty}>아직 업로드된 사진이 없습니다.</p>
        ) : (
          <div style={styles.photoGrid}>
            {photos.map((p) => (
              <div key={p.id} style={styles.photoCard}>
                <img src={p.url} style={styles.photo} />
                <div style={styles.photoInfo}>
                  <span>📷 {p.name}</span>
                  <span style={styles.date}>
                    {new Date(p.created_at).toLocaleString()}
                  </span>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => deletePhoto(p.id)}
                  >
                    ❌ 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function mealText(meal: string) {
  switch (meal) {
    case "yes":
      return "예정";
    case "undecided":
      return "미정";
    case "no":
      return "불참";
    default:
      return "-";
  }
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#fff7f5",
    fontFamily: "Noto Sans KR",
  },
  loginCard: {
    background: "white",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "90%",
    maxWidth: 400,
    textAlign: "center",
  },
  input: {
    padding: 10,
    width: "100%",
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 12,
  },
  button: {
    width: "100%",
    padding: "10px 18px",
    background: "#ff8a80",
    color: "white",
    borderRadius: 6,
    border: "none",
  },
  container: {
    padding: "20px 10px",
    background: "#fffaf8",
    minHeight: "100vh",
    fontFamily: "Noto Sans KR",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 40,
  },
  subtitle: {
    marginBottom: 10,
    color: "#e57373",
  },
  cardList: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  },
  card: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },
  name: { fontWeight: 700, marginBottom: 5 },
  content: { marginBottom: 8, lineHeight: 1.4 },
  date: { color: "#777", fontSize: 13 },

  empty: { textAlign: "center", color: "#999" },

  /** 📌 사진 갤러리 스타일 */
  photoGrid: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  },
  photoCard: {
    borderRadius: 10,
    overflow: "hidden",
    background: "white",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },
  photo: {
    width: "100%",
    display: "block",
  },
  photoInfo: {
    padding: "8px 10px",
    fontSize: 14,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  deleteBtn: {
    alignSelf: "flex-end",
    padding: "4px 8px",
    fontSize: 12,
    border: "none",
    background: "#ff6b6b",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
  },
};
