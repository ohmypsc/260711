import { useEffect, useMemo, useRef, useState } from "react";
import "./Timeline.scss"; // ✅ 이 SCSS 파일을 수정해야 합니다.

/** Vite: src/image 안 jpg 동적 로드 */
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
  title?: string; // 단순 string 타입
  date?: string;
  desc?: string;
};

const captions: Caption[] = [
  { imgIndex: 1, title: "1989년 가을에 태어난 승철이와" },
  { imgIndex: 2, title: "1990년 봄에 태어난 미영이가" },
  { imgIndex: 3, title: "2024년 가을에 만나" },
  { imgIndex: 4, title: "2024년 겨울, 행복한 일들이 펼쳐집니다." },
  { imgIndex: 5, title: "2025년 봄, 새로운 시작을 함께합니다." },
  { imgIndex: 6, title: "2025년 여름, 뜨거운 추억을 쌓아갑니다." },
  { imgIndex: 7, title: "2025년 가을, 결실의 계절을 맞이합니다." },
  { imgIndex: 8, title: "2025년 겨울, 따뜻한 사랑을 나눕니다." },
  { imgIndex: 9, title: "2026년 봄을 지나, 영원한 사랑을 약속합니다." },
];

const captionMap = new Map<number, Caption>(captions.map((c) => [c.imgIndex, c]));

type TimelineItem = {
  imgIndex: number;
  key: string; // glob key
  caption?: Caption;
  hasCaption: boolean;
};

// ===============================================
// 하이브리드 등장 애니메이션 Hook (유지)
// ===============================================
const useHybridTimelineAppear = (
  itemCount: number,
  initialDelayMs: number = 500
) => {
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const [visibleItems, setVisibleItems] = useState(new Set<number>());

  useEffect(() => {
    let timerId: number | undefined;
    let initialVisibleIndices: number[] = [];
    let initialObserver: IntersectionObserver | null = null;
    let scrollObserver: IntersectionObserver | null = null;

    initialObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            initialVisibleIndices.push(index);
          }
        });

        obs.disconnect();

        initialVisibleIndices.sort((a, b) => a - b);
        let currentTimerIndex = 0;

        const startScrollObserver = () => {
          scrollObserver = new IntersectionObserver(
            (entries, observer) => {
              entries.forEach((entry) => {
                const index = Number(entry.target.getAttribute("data-index"));

                if (entry.isIntersecting) {
                  setVisibleItems((prev) => {
                    if (prev.has(index)) return prev;
                    const next = new Set(prev);
                    next.add(index);
                    return next;
                  });
                  observer.unobserve(entry.target);
                }
              });
            },
            { rootMargin: "0px", threshold: 0.1 }
          );

          Object.values(itemRefs.current).forEach((el) => {
            const index = Number(el?.getAttribute("data-index"));
            if (el && !initialVisibleIndices.includes(index)) {
              scrollObserver!.observe(el);
            }
          });
        };

        const startInitialTimer = () => {
          if (currentTimerIndex < initialVisibleIndices.length) {
            const indexToReveal = initialVisibleIndices[currentTimerIndex];
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.add(indexToReveal);
              return next;
            });
            currentTimerIndex++;
            timerId = setTimeout(
              startInitialTimer,
              initialDelayMs
            ) as unknown as number;
          } else {
            startScrollObserver();
          }
        };

        startInitialTimer();
      },
      { rootMargin: "0px", threshold: 0.1 }
    );

    Object.values(itemRefs.current).forEach((el) => {
      if (el) initialObserver!.observe(el);
    });

    return () => {
      clearTimeout(timerId);
      initialObserver?.disconnect();
      scrollObserver?.disconnect();
    };
  }, [itemCount, initialDelayMs]);

  return { itemRefs, visibleItems };
};

/**
 * LazyImage (이미지 지연 로딩 컴포넌트 유지)
 */
function LazyImage({
  srcPromise,
  alt,
  aboveFold = false,
}: {
  srcPromise: () => Promise<string>;
  alt: string;
  aboveFold?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(aboveFold);
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (aboveFold) return;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "600px",
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [aboveFold]);

  useEffect(() => {
    if (!shouldLoad || src) return;

    let cancelled = false;
    srcPromise().then((url) => {
      if (!cancelled) setSrc(url);
    });

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, src, srcPromise]);

  return (
    <div
      ref={ref}
      className={`lazy-photo ${loaded ? "is-loaded" : "is-loading"}`}
      aria-label={alt}
    >
      {!loaded && <div className="photo-skeleton" aria-hidden="true" />}

      {src && (
        <img
          src={src}
          alt={alt}
          loading={aboveFold ? "eager" : "lazy"}
          fetchPriority={aboveFold ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

// ===============================================
// Timeline 메인
// ===============================================
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
              ref={(el) => (itemRefs.current[idx] = el)}
              data-index={idx}
              className={`timeline-item ${side} ${
                isVisible ? "is-visible" : "not-visible"
              }`}
            >
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
                    aboveFold={item.imgIndex <= 2}
                  />
                </div>
              </div>

              {/* 캡션 */}
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
