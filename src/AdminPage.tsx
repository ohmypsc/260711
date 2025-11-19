import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/** 타입 정의 */
interface Guestbook {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface Attendance {
  id: string;
  name: string;
  side: "groom" | "bride";
  meal: "yes" | "no" | "undecided";
  count: number;
  created_at: string;
}

interface Photo {
  id: string;
  name: string;
  url: string;
  path: string;
  created_at: string;
}

/** 환경변수 비밀번호 (하드코딩 방지) */
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PW;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [guestbook, setGuestbook] = useState<Guestbook[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  /* ---------------- Login ---------------- */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  /* ---------------- Load Data ---------------- */
  useEffect(() => {
    if (!authenticated) return;

    let mounted = true;

    (async () => {
      const { data: g } = await supabase
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: a } = await supabase
        .from("attendance")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: p } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted) {
        setGuestbook(g ?? []);
        setAttendance(a ?? []);
        setPhotos(p ?? []);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authenticated]);

  /* ---------------- Delete Photo ---------------- */
  const deletePhoto = async (id: string, path: string) => {
    const ok = confirm("사진을 삭제하시겠습니까?");
    if (!ok) return;

    await supabase.from("gallery").delete().eq("id", id);
    await supabase.storage.from("photos").remove([path]);

    // reload
    const { data: newPhotos } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    setPhotos(newPhotos ?? []);
  };

  /* 로그인 화면 */
  if (!authenticated) {
    return (
      <div style={loginStyle.wrap}>
        <div style={loginStyle.card}>
          <h2 style={loginStyle.title}>관리자 로그인</h2>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={loginStyle.input}
            />
            <button type="submit" style={loginStyle.button}>
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* 관리자 페이지 */
  return (
    <div style={ui.container}>
      <h1 style={ui.mainTitle}>💒 관리자 페이지</h1>

      {/* 방명록 */}
      <Section title="📖 방명록 목록">
        {guestbook.length === 0 ? (
          <Empty />
        ) : (
          <div style={ui.grid}>
            {guestbook.map((g) => (
              <Card key={g.id}>
                <h3 style={ui.cardName}>🧡 {g.name}</h3>
                <p style={ui.cardContent}>{g.content}</p>
                <p style={ui.cardDate}>
                  {new Date(g.created_at).toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* 참석 의사 */}
      <Section title="💌 참석 의사 목록">
        {attendance.length === 0 ? (
          <Empty />
        ) : (
          <div style={ui.grid}>
            {attendance.map((a) => (
              <Card key={a.id}>
                <h3 style={ui.cardName}>
                  🎉 {a.name} ({a.side === "groom" ? "신랑 측" : "신부 측"})
                </h3>
                <p>🍽 식사: {mealText(a.meal)}</p>
                <p>👥 인원: {a.count}명</p>
                <p style={ui.cardDate}>
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* 사진 목록 */}
      <Section title="🖼 하객 사진 목록">
        {photos.length === 0 ? (
          <Empty />
        ) : (
          <div style={ui.photoGrid}>
            {photos.map((p) => (
              <div key={p.id} style={ui.photoCard}>
                <img src={p.url} style={ui.photo} />
                <div style={ui.photoInfo}>
                  <span>{p.name}</span>
                  <span style={ui.cardDate}>
                    {new Date(p.created_at).toLocaleString()}
                  </span>
                  <button
                    style={ui.deleteBtn}
                    onClick={() => deletePhoto(p.id, p.path)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ------------------- 공통 컴포넌트 ------------------- */

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <section style={ui.section}>
      <h2 style={ui.sectionTitle}>{props.title}</h2>
      {props.children}
    </section>
  );
}

function Card(props: { children: React.ReactNode }) {
  return <div style={ui.card}>{props.children}</div>;
}

function Empty() {
  return <p style={ui.empty}>아직 데이터가 없습니다.</p>;
}

function mealText(meal: string) {
  return {
    yes: "예정",
    undecided: "미정",
    no: "불참",
  }[meal] ?? "-";
}

/* ------------------- 스타일 ------------------- */

const ui = {
  container: {
    padding: "20px 12px",
    background: "#fff9f8",
    minHeight: "100vh",
    fontFamily: "Noto Sans KR",
  },
  mainTitle: {
    textAlign: "center",
    marginBottom: 30,
    color: "#C47B85",
    fontWeight: 600,
  },

  section: { marginBottom: 50 },
  sectionTitle: {
    marginBottom: 16,
    color: "#A45F6D",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },

  card: {
    background: "white",
    padding: "16px 18px",
    borderRadius: 12,
    boxShadow: "0 3px 16px rgba(0,0,0,0.08)",
  },

  cardName: {
    fontWeight: 700,
    marginBottom: 6,
  },

  cardContent: {
    marginBottom: 10,
    lineHeight: 1.45,
  },

  cardDate: {
    color: "#888",
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    color: "#999",
    padding: 20,
  },

  /* 사진 */
  photoGrid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  },
  photoCard: {
    background: "white",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  photo: { width: "100%", display: "block" },
  photoInfo: {
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
  },
  deleteBtn: {
    alignSelf: "flex-end",
    padding: "4px 8px",
    background: "#E57373",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
};

/* 로그인 스타일 */
const loginStyle = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#FFF7F8",
  },
  card: {
    background: "white",
    padding: 30,
    width: "90%",
    maxWidth: 380,
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    textAlign: "center" as const,
  },
  title: { marginBottom: 14, color: "#C47B85", fontWeight: 600 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 14,
  },
  button: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    background: "#C47B85",
    color: "white",
    border: "none",
    fontWeight: 600,
  },
};
