import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
  title?: ReactNode;
  date?: string;
  desc?: string;
};

/** 캡션 데이터 (기존과 동일) */
const captions: Caption[] = [
  { imgIndex: 1, title: (<><span className="no-break">1989년에 태어난</span> 승철이와</>), },
  { imgIndex: 2, title: (<><span className="no-break">1990년에 태어난</span> 미영이가</>), },
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
  key: string; 
  caption?: Caption;
  hasCaption: boolean;
};

// ===============================================
// ⭐ 1. 초기/스크롤 분리 등장 애니메이션을 위한 Hook
// ===============================================

/**
 * 초기 화면의 N개 아이템은 타이머로, 나머지는 스크롤로 순차 등장시키는 Hook
 */
const useAppearOnScrollAndInitialTimer = (
  itemCount: number, 
  initialItemsCount: number = 3, // 초기 자동 등장시킬 아이템 개수 (조정 가능)
  initialDelayMs: number = 500
) => {
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  // 타이머나 스크롤에 의해 등장한 아이템의 인덱스 Set
  const [visibleItems, setVisibleItems] = useState(new Set<number>());

  useEffect(() => {
    let timerId: number | undefined;

    // ------------------------------------------
    // A. 초기 아이템 (0 ~ N-1) 타이머로 등장
    // ------------------------------------------
    let currentTimerIndex = 0;
    const startInitialTimer = () => {
        if (currentTimerIndex < initialItemsCount && currentTimerIndex < itemCount) {
            setVisibleItems(prev => {
                const newSet = new Set(prev);
                newSet.add(currentTimerIndex);
                return newSet;
            });
            currentTimerIndex++;
            timerId = setTimeout(startInitialTimer, initialDelayMs) as unknown as number;
        }
    };
    
    // 타이머 시작 (컴포넌트 마운트 시)
    startInitialTimer();


    // ------------------------------------------
    // B. 나머지 아이템 (N 이상) Intersection Observer로 등장
    // ------------------------------------------
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = Number(entry.target.getAttribute('data-index'));
          
          if (entry.isIntersecting) {
            // ⭐ 타이머로 이미 처리된 아이템은 무시
            if (index < initialItemsCount) return; 

            setVisibleItems(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
            // 등장했으니 관찰 중단
            observer.unobserve(entry.target); 
          }
        });
      },
      // IO 감지 영역: 뷰포트에 들어올 때 (0px) 감지 시작
      { rootMargin: "0px", threshold: 0.1 } 
    );

    // N번째 아이템부터 관찰 시작
    Object.values(itemRefs.current).forEach(el => {
      const index = Number(el?.getAttribute('data-index'));
      if (el && index >= initialItemsCount) {
        observer.observe(el);
      }
    });

    // 클린업
    return () => {
      clearTimeout(timerId);
      observer.disconnect();
    };

  }, [itemCount, initialItemsCount, initialDelayMs]);

  return { itemRefs, visibleItems };
};


// ===============================================
// 2. LazyImage 컴포넌트 (지연 로딩 및 로드 범위 확대 유지)
// ===============================================

/**
 * 체감 Lazy 로딩 컴포넌트 (IO로 1000px 전에 미리 import 시작)
 */
function LazyImage({
  srcPromise,
  alt,
}: {
  srcPromise: () => Promise<string>;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false); 
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // IO로 "근처 오면" 로드 시작 (모든 이미지에 적용)
  useEffect(() => {
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
        // 로딩 지연 개선을 위해 1000px로 유지
        rootMargin: "1000px", 
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 실제 src import
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
      {/* 스켈레톤(로딩 중) */}
      {!loaded && <div className="photo-skeleton" aria-hidden="true" />}

      {/* 실제 이미지 */}
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy" 
          fetchPriority="auto"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

// ===============================================
// 3. Timeline 메인 컴포넌트
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

  // ⭐ 하이브리드 등장 Hook 사용: 첫 3개 아이템을 0.5초 간격으로 자동 등장
  const { itemRefs, visibleItems } = useAppearOnScrollAndInitialTimer(items.length, 3, 500); 

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
              // IO 감지를 위해 ref와 data-index 사용
              ref={el => itemRefs.current[idx] = el}
              data-index={idx}
              className={`timeline-item ${side} ${isVisible ? 'is-visible' : 'not-visible'}`}
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
                    alt={(cap?.title as string) ?? `timeline-${item.imgIndex}`}
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
