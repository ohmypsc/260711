import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import "./Timeline.scss";

/** Vite: src/image 안 jpg 자동 로드 (동적 import) */
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
  title?: ReactNode; // JSX 가능
};

/** 타이틀 no-break */
const captions: Caption[] = [
  { imgIndex: 1, title: <span className="no-break">1989년에 태어난 승철이와대체뭐가문제야머리아파죽겠네짜증짜증제발좀</span> },
  { imgIndex: 2, title: <span className="no-break">1990년에 태어난 미영이가</span> },
  { imgIndex: 3, title: <span className="no-break">2024년 가을에 만나</span> },
  { imgIndex: 4, title: <span className="no-break">2024년 겨울,</span> },
  { imgIndex: 5, title: <span className="no-break">2025년 봄,</span> },
  { imgIndex: 6, title: <span className="no-break">2025년 여름,</span> },
  { imgIndex: 7, title: <span className="no-break">2025년 가을,</span> },
  { imgIndex: 8, title: <span className="no-break">2025년 겨울,</span> },
  { imgIndex: 9, title: <span className="no-break">2026년 봄을 지나</span> },
];

const captionMap = new Map<number, Caption>(captions.map((c) => [c.imgIndex, c]));

type TimelineItem = {
  imgIndex: number;
  key: string; // glob key
  caption?: Caption;
  hasCaption: boolean;
};

// ===============================================
// 폰트 로딩 감지 Hook (유지)
// ===============================================
const useFontLoaded = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setLoaded(true));
  }, []);
  return loaded;
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

// ===============================================
// ✅ 캡션 타이틀 자동 축소 (모바일 안정 완성본)
// - "h3"가 아니라 "텍스트 span" 폭으로 측정(모바일/Safari 안정)
// - 컬럼 실제 내부 폭(clientWidth - padding) 기준
// - 첫 페인트 전에 fit() 1회 즉시 실행
// ===============================================
function AutoFitTitle({
  children,
  watchKey,
}: {
  children: ReactNode;
  watchKey: string;
}) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [fontSize, setFontSize] = useState<string>("");

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf = 0;

    const fit = () => {
      // 리셋(정확한 측정용)
      container.style.fontSize = "";
      container.style.whiteSpace = "nowrap";
      setFontSize("");

      // ✅ 컬럼 실제 텍스트 영역 폭(부모 padding 제외)
      const parent = container.parentElement as HTMLElement | null;
      let containerWidth = parent?.clientWidth ?? container.clientWidth;

      if (parent) {
        const ps = window.getComputedStyle(parent);
        const pl = parseFloat(ps.paddingLeft) || 0;
        const pr = parseFloat(ps.paddingRight) || 0;
        containerWidth = Math.max(0, containerWidth - pl - pr);
      }

      // ✅ 텍스트 자체 폭 (모바일 안정)
      const textWidth = textEl.scrollWidth;

      const base =
        parseFloat(window.getComputedStyle(container).fontSize) || 16;

      if (containerWidth > 0 && textWidth > containerWidth) {
        const next = base * (containerWidth / textWidth) * 0.98;
        setFontSize(`${next}px`);
      } else {
        setFontSize("");
      }
    };

    // ✅ 첫 페인트 전에 1회
    fit();

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);

    // 폰트/레이아웃 확정 타이밍 보강
    const t1 = window.setTimeout(schedule, 0);
    const t2 = window.setTimeout(schedule, 120);

    const onResize = () => schedule();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [watchKey]);

  return (
    <h3
      ref={containerRef}
      className="title"
      style={{
        fontSize: fontSize || undefined,
        whiteSpace: "nowrap",
      }}
    >
      <span
        ref={textRef}
        className="title-text"
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </h3>
  );
}

/**
 * LazyImage (유지)
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
      const hasCaption = Boolean(caption?.title);
      return { imgIndex, key, caption, hasCaption };
    });
  }, []);

  const { itemRefs, visibleItems } = useHybridTimelineAppear(items.length, 500);
  const isFontLoaded = useFontLoaded();

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
                    alt={
                      typeof cap?.title === "string"
                        ? cap.title
                        : `timeline-${item.imgIndex}`
                    }
                    aboveFold={item.imgIndex <= 2}
                  />
                </div>
              </div>

              {/* 캡션 */}
              {item.hasCaption && (
                <div className="caption-col">
                  {cap?.title && (
                    <AutoFitTitle
                      watchKey={`${idx}-${isVisible ? "v" : "h"}-${
                        isFontLoaded ? "f" : "u"
                      }`}
                    >
                      {cap.title}
                    </AutoFitTitle>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
