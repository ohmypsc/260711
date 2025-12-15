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
// ⭐ 1. 스크롤 기반 등장 애니메이션을 위한 Hook (Intersection Observer 기반)
// ===============================================

/**
 * 스크롤 시 뷰포트에 들어온 아이템에 is-visible 클래스를 추가하는 Hook
 */
const useAppearOnScroll = (rootMargin: string = "0px") => {
  // 아이템의 ref를 저장할 객체
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  // 뷰포트에 보이는 아이템의 인덱스 Set
  const [visibleItems, setVisibleItems] = useState(new Set<number>());

  useEffect(() => {
    // Intersection Observer 인스턴스 생성
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // data-index 속성에서 인덱스 값을 가져옴
          const index = Number(entry.target.getAttribute('data-index'));
          
          if (entry.isIntersecting) {
            setVisibleItems(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
            // 일단 나타난 아이템은 다시 숨기지 않기 위해 관찰 중단
            observer.unobserve(entry.target); 
          }
        });
      },
      // rootMargin을 통해 조금 더 일찍 감지 시작 (0px 기본)
      { rootMargin, threshold: 0.1 } 
    );

    // 모든 타임라인 아이템 관찰 시작
    Object.values(itemRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [rootMargin]);

  return { itemRefs, visibleItems };
};


// ===============================================
// 2. LazyImage 컴포넌트 (모든 이미지 지연 로드 유지)
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
  // aboveFold가 제거되었으므로, 초기값은 항상 false로 설정하여 지연 로드를 시작
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
        // ⭐ 감지 범위를 1000px로 확대하여 로드를 더 일찍 시작 (로딩 지연 개선)
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
          loading="lazy" // ⭐ 모든 이미지에 lazy 고정
          fetchPriority="auto" // ⭐ 모든 이미지에 auto 고정
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

  // ⭐ 스크롤 기반 등장 Hook 재적용
  const { itemRefs, visibleItems } = useAppearOnScroll("0px"); 

  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {items.map((item, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";
          const cap = item.caption;
          
          // ⭐ is-visible 클래스 적용
          const isVisible = visibleItems.has(idx);

          return (
            <li 
              key={item.imgIndex} 
              // ⭐ 클래스 추가: is-visible / not-visible
              className={`timeline-item ${side} ${isVisible ? 'is-visible' : 'not-visible'}`}
              // ⭐ ref 및 data-index 설정 (IO 작동에 필수)
              ref={el => itemRefs.current[idx] = el}
              data-index={idx}
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
                    // aboveFold 속성을 제거하거나 false로 고정하여 모든 이미지 지연 로드
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
