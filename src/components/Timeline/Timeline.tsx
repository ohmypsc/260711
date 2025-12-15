import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Timeline.scss";

const imageModules = import.meta.glob("/src/image/*.jpg", {
  eager: false,
  import: "default",
}) as Record<string, () => Promise<string>>;

const imageKeys = Object.keys(imageModules).sort((a, b) => {
  const na = Number(a.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  const nb = Number(b.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  return na - nb;
});

type Caption = {
  imgIndex: number;
  title?: ReactNode;
  date?: string;
  desc?: string;
};

const captions: Caption[] = [
  { imgIndex: 1, title: <span className="no-break">1989년에 태어난 승철이와</span> },
  { imgIndex: 2, title: <span className="no-break">1990년에 태어난 미영이가</span> },
  { imgIndex: 3, title: <span className="no-break">2024년 가을에 만나</span> },
  { imgIndex: 4, title: <span className="no-break">2024년 겨울,</span> },
  { imgIndex: 5, title: <span className="no-break">2025년 봄,</span> },
  { imgIndex: 6, title: <span className="no-break">2025년 여름,</span> },
  { imgIndex: 7, title: <span className="no-break">2025년 가을,</span> },
  { imgIndex: 8, title: <span className="no-break">2025년 겨울,</span> },
  { imgIndex: 9, title: <span className="no-break">2026년 봄을 지나</span> },
];

const captionMap = new Map<number, Caption>(captions.map(c => [c.imgIndex, c]));

type TimelineItem = {
  imgIndex: number;
  key: string;
  caption?: Caption;
  hasCaption: boolean;
};

/* ======================================================
   ✅ NEW: 타이틀 전용 "무한 축소" 컴포넌트
   ====================================================== */

function AutoFitTitle({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const [fontSize, setFontSize] = useState<string>("");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const fit = () => {
      // 기준 크기로 리셋
      el.style.fontSize = "";
      el.style.whiteSpace = "nowrap";

      const baseSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      const containerWidth = el.clientWidth;
      const textWidth = el.scrollWidth;

      if (containerWidth > 0 && textWidth > containerWidth) {
        const ratio = containerWidth / textWidth;
        const nextSize = baseSize * ratio * 0.98; // 여유 2%
        setFontSize(`${nextSize}px`);
      } else {
        setFontSize("");
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    schedule();
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <h3
      ref={ref}
      className="title"
      style={{
        fontSize,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </h3>
  );
}

/* ---------- LazyImage, Hook, 나머지 전부 기존 그대로 ---------- */
/* (중간 코드 생략 없이 그대로 유지되어야 함) */

/* ======================================================
   Timeline 메인
   ====================================================== */

export function Timeline() {
  const items: TimelineItem[] = useMemo(() => {
    return imageKeys.map((key, i) => {
      const imgIndex = i + 1;
      const caption = captionMap.get(imgIndex);
      const hasCaption = Boolean(caption?.title || caption?.date || caption?.desc);
      return { imgIndex, key, caption, hasCaption };
    });
  }, []);

  const { itemRefs, visibleItems } = useHybridTimelineAppear(items.length, 500);

  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {items.map((item, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";
          const cap = item.caption;
          const isVisible = visibleItems.has(idx);

          return (
            <li
              key={item.imgIndex}
              ref={el => (itemRefs.current[idx] = el)}
              data-index={idx}
              className={`timeline-item ${side} ${isVisible ? "is-visible" : "not-visible"}`}
            >
              <div className="line-col">
                <span className="dot" />
              </div>

              <div className="media">
                <div className="photo-wrap">
                  <LazyImage
                    srcPromise={imageModules[item.key]}
                    alt={`timeline-${item.imgIndex}`}
                    aboveFold={item.imgIndex <= 2}
                  />
                </div>
              </div>

              {item.hasCaption && (
                <div className="caption-col">
                  {cap?.date && <p className="date">{cap.date}</p>}
                  {cap?.title && <AutoFitTitle>{cap.title}</AutoFitTitle>}
                  {cap?.desc && <p className="desc">{cap.desc}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
