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
  title?: ReactNode; // ✅ JSX도 받게
  date?: string;
  desc?: string;
};

/** ✅ 1,2번 타이틀을 no-break span으로 감쌈 */
const captions: Caption[] = [
  {
    imgIndex: 1,
    title: (
      <>
        <span className="no-break">1989년에 태어난</span> 승철이와
      </>
    ),
  },
  {
    imgIndex: 2,
    title: (
      <>
        <span className="no-break">1990년에 태어난</span> 미영이가
      </>
    ),
  },
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
  key: string; // glob key
  caption?: Caption;
  hasCaption: boolean;
};

// ===============================================
// ⭐ 1. 자동 순차 등장 애니메이션을 위한 Hook (Timer 기반)
// ===============================================

/**
 * 컴포넌트 마운트 후 지정된 딜레이 간격으로 아이템을 순차적으로 나타나게 하는 Hook
 */
const useSequentialAppear = (itemCount: number, delayMs: number = 300) => {
  // 현재 is-visible 상태인 아이템의 개수 (0부터 시작)
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= itemCount) return; // 모든 아이템이 나타났다면 종료

    const timer = setTimeout(() => {
      // 딜레이 간격으로 visibleCount 증가
      setVisibleCount(prev => prev + 1);
    }, delayMs);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, [visibleCount, itemCount, delayMs]);

  // 해당 인덱스가 현재 visibleCount 범위 내에 있는지 확인하는 함수
  const isVisible = (index: number) => index < visibleCount;
  
  return { isVisible };
};


// ===============================================
// 2. LazyImage 컴포넌트 (기존 로직 유지)
// ===============================================

/**
 * 체감 Lazy 로딩 컴포넌트 (IO로 600px 전에 미리 import 시작)
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

  // IO로 "근처 오면" 로드 시작 (첫 화면 제외)
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
        rootMargin: "600px", // 훨씬 일찍 받아서 "느리게 뜸" 완화
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [aboveFold]);

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
          loading={aboveFold ? "eager" : "lazy"} // 첫 2장은 eager
          fetchPriority={aboveFold ? "high" : "auto"}
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

  // ⭐ 수정된 등장 Hook 사용 (300ms 간격으로 등장)
  const { isVisible } = useSequentialAppear(items.length, 300); 

  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {items.map((item, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";
          const cap = item.caption;
          
          // ⭐ isVisible 함수로 클래스 적용
          const shouldAppear = isVisible(idx);

          return (
            <li 
              key={item.imgIndex} 
              // 'ref'와 'data-index'는 자동 등장에서는 불필요하므로 제거됨
              className={`timeline-item ${side} ${shouldAppear ? 'is-visible' : 'not-visible'}`}
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
                    aboveFold={item.imgIndex <= 2} // 첫 2장은 즉시 로드 (성능)
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
