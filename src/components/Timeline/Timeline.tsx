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
        <span className="no-break">1989년에 태어난 승철이와</span>
      </>
    ),
  },
  {
    imgIndex: 2,
    title: (
      <>
        <span className="no-break">1990년에 태어난 미영이가</span>
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
// 2. LazyImage 컴포넌트 (AboveFold 로직 수정)
// ===============================================

/**
 * 체감 Lazy 로딩 컴포넌트 (AboveFold 로직이 제거되거나 비활성화되어 모든 이미지에 Lazy Loading 적용)
 */
function LazyImage({
  srcPromise,
  alt,
  aboveFold = false,
}: {
  srcPromise: () => Promise<string>;
  alt: string;
  aboveFold?: boolean; // 이 값은 이제 항상 false로 전달될 것임
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // ⭐ shouldLoad는 이제 Intersection Observer에 의해서만 결정됨
  const [shouldLoad, setShouldLoad] = useState(false); 
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // IO로 "근처 오면" 로드 시작
  useEffect(() => {
    // aboveFold 체크를 제거하거나, (위에 이미 false로 고정했으므로)
    // 혹은 아래의 IO 로직이 모든 이미지에 적용되도록 수정

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
  }, []); // 의존성 배열에서 aboveFold를 제거하거나, 아예 false로 고정하여 모든 이미지에 IO 적용

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
          loading={"lazy"} // ⭐ 모든 이미지에 lazy 고정
          fetchPriority={"auto"} // ⭐ 모든 이미지에 auto 고정
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

// ===============================================
// 3. Timeline 메인 컴포넌트 (AboveFold 호출 제거)
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

  // 자동 순차 등장 Hook 사용
  const { isVisible } = useSequentialAppear(items.length, 300); 

  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {items.map((item, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";
          const cap = item.caption;
          
          const shouldAppear = isVisible(idx);

          return (
            <li 
              key={item.imgIndex} 
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
                    aboveFold={false} 
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
