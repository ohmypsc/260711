import { useEffect, useMemo, useRef, useState } from "react";
import "./Timeline.scss";

/** Vite: src/image 안 jpg 자동 로드
 *  ✅ eager:false 로 바꿔서 "모듈을 미리 다 불러오는" 느낌도 줄임
 *  (IntersectionObserver lazy와 같이 쓰면 가장 체감이 좋음)
 */
const imageModules = import.meta.glob("/src/image/*.jpg", {
  eager: false,
  import: "default",
}) as Record<string, () => Promise<string>>;

/** 이미지 경로를 번호순으로 정렬한 "키 목록" */
const imageKeys = Object.keys(imageModules).sort((a, b) => {
  const na = Number(a.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  const nb = Number(b.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  return na - nb;
});

type Caption = {
  imgIndex: number; // 1-based
  title?: string;
  date?: string;
  desc?: string;
};

const captions: Caption[] = [
  { imgIndex: 1, title: "1989년 가을에 태어난 승철이와" },
  { imgIndex: 2, title: "1990년 봄에 태어난 미영이가" },
  { imgIndex: 3, title: "2024년 가을에 만나" },
  { imgIndex: 4, title: "2024년 겨울," },
  { imgIndex: 5, title: "2025년 봄," },
  { imgIndex: 6, title: "2025년 여름," },
  { imgIndex: 7, title: "2025년 가을," },
  { imgIndex: 8, title: "2025년 겨울," },
  { imgIndex: 9, title: "2026년 봄을 지나" },
];

const captionMap = new Map<number, Caption>(captions.map((c) => [c.imgIndex, c]));

type TimelineItem = {
  imgIndex: number;
  key: string;         // glob key
  caption?: Caption;
  hasCaption: boolean;
};

/** ✅ IntersectionObserver 기반 LazyImage */
function LazyImage({
  srcPromise,
  alt,
  className,
}: {
  srcPromise: () => Promise<string>;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      {
        root: null,          // viewport 기준
        rootMargin: "200px", // 200px 전부터 미리 로드
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || src) return;

    let cancelled = false;
    srcPromise().then((url) => {
      if (!cancelled) setSrc(url);
    });

    return () => {
      cancelled = true;
    };
  }, [visible, src, srcPromise]);

  return (
    <img
      ref={ref}
      src={src ?? undefined}    // ✅ 보이기 전엔 src 없음 → 네트워크 요청 X
      alt={alt}
      className={className}
      loading="lazy"            // 보조용 (native)
      decoding="async"
    />
  );
}

export function Timeline() {
  const items: TimelineItem[] = useMemo(() => {
    return imageKeys.map((key, i) => {
      const imgIndex = i + 1;
      const caption = captionMap.get(imgIndex);
      const hasCaption = Boolean(caption?.title || caption?.date || caption?.desc);
      return { imgIndex, key, caption, hasCaption };
    });
  }, []);

  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {items.map((item, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";
          const cap = item.caption;

          return (
            <li key={item.imgIndex} className={`timeline-item ${side}`}>
              {/* 가운데 라인 */}
              <div className="line-col">
                <span className="dot" aria-hidden="true" />
              </div>

              {/* 사진 */}
              <div className="media">
                <div className="photo-wrap">
                  <LazyImage
                    srcPromise={imageModules[item.key]}
                    alt={cap?.title ?? `timeline-${item.imgIndex}`}
                  />
                </div>
              </div>

              {/* 캡션(반대편 칼럼) */}
              {item.hasCaption && (
                <div className="caption-col">
                  {cap?.date && <p className="date">{cap.date}</p>}
                  {cap?.title && <h3 className="title">{cap.title}</h3>}
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
