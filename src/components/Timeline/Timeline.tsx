import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import "./Timeline.scss";

/** * ✅ 수정 1: WebP 파일도 읽어오도록 수정하고, 
 * 속도 향상을 위해 eager: true 로 변경하여 Promise 대기 시간을 없앰!
 */
const imageModules = import.meta.glob("/src/image/*.{jpg,webp,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

/** ✅ 수정 2: 정렬할 때 확장자가 webp여도 숫자를 제대로 인식하도록 정규식 수정 */
const imageKeys = Object.keys(imageModules).sort((a, b) => {
  const na = Number(a.match(/(\d+)\.(jpg|webp|png)$/)?.[1] ?? 0);
  const nb = Number(b.match(/(\d+)\.(jpg|webp|png)$/)?.[1] ?? 0);
  return na - nb;
});

type Caption = {
  imgIndex: number; // 1-based
  title?: ReactNode; // JSX 가능
};

/** 타이틀 no-break */
const captions: Caption[] = [
  { imgIndex: 1, title: <span className="no-break">가을에 태어난 승철이와</span> },
  { imgIndex: 2, title: <span className="no-break">봄에 태어난 미영이가</span> },
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
// 폰트 로딩 감지 Hook
// ===============================================
const useFontLoaded = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setLoaded(true));
  }, []);
  return loaded;
};

// ===============================================
// 하이브리드 등장 애니메이션 Hook
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
// AutoFitTitle
// ===============================================
function AutoFitTitle({
  children,
  watchKey,
}: {
  children: ReactNode;
  watchKey: string;
}) {
  const hRef = useRef<HTMLHeadingElement | null>(null);
  const sRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const h = hRef.current;
    const s = sRef.current;
    if (!h || !s) return;

    let raf = 0;

    const measureTextWidth = () => {
      const range = document.createRange();
      range.selectNodeContents(s);
      const w = range.getBoundingClientRect().width;
      range.detach?.();
      return w;
    };

    const fit = () => {
      h.style.whiteSpace = "nowrap";
      h.style.fontSize = "";

      const parent = h.parentElement as HTMLElement | null;
      let cw = parent ? parent.getBoundingClientRect().width : h.getBoundingClientRect().width;

      if (parent) {
        const ps = getComputedStyle(parent);
        const pl = parseFloat(ps.paddingLeft) || 0;
        const pr = parseFloat(ps.paddingRight) || 0;
        cw = Math.max(0, cw - pl - pr);
      }

      const tw = measureTextWidth();

      if (cw > 0 && tw > cw) {
        const base = parseFloat(getComputedStyle(h).fontSize) || 16;
        const next = base * (cw / tw) * 0.98;
        h.style.fontSize = `${next}px`;
      }
    };

    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        requestAnimationFrame(fit);
      });
    };

    run();

    const ro = new ResizeObserver(run);
    ro.observe(h);
    if (h.parentElement) ro.observe(h.parentElement);

    const t1 = window.setTimeout(run, 0);
    const t2 = window.setTimeout(run, 120);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [watchKey]);

  return (
    <h3 ref={hRef} className="title" style={{ whiteSpace: "nowrap" }}>
      <span ref={sRef} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {children}
      </span>
    </h3>
  );
}

// ===============================================
// ✅ 수정 3: 훨씬 가벼워진 LazyImage 
// ===============================================
function LazyImage({
  srcUrl,
  alt,
  aboveFold = false,
}: {
  srcUrl: string; // Promise 대기 없이 즉시 URL 주소를 받음
  alt: string;
  aboveFold?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(aboveFold);
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
        rootMargin: "1000px", // 미리 불러오는 구간을 넉넉하게 확장
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [aboveFold]);

  return (
    <div
      ref={ref}
      className={`lazy-photo ${loaded ? "is-loaded" : "is-loading"}`}
      aria-label={alt}
    >
      {!loaded && <div className="photo-skeleton" aria-hidden="true" />}

      {shouldLoad && (
        <img
          src={srcUrl}
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
    <div className="timeline-wrapper">
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
                  {/* ✅ 수정 4: srcPromise 대신 srcUrl 사용 */}
                  <LazyImage
                    srcUrl={imageModules[item.key]}
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
