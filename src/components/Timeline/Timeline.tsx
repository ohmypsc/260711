import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import "./Timeline.scss";

// ... (기존 imageModules, imageKeys, captions, captionMap, TimelineItem 타입 정의는 그대로 유지) ...

// ===============================================
// ⭐ 1. 하이브리드 등장 애니메이션을 위한 Hook
// ===============================================

/**
 * 초기 아이템은 타이머로, 이후 아이템은 스크롤(IO)로 제어하는 Hook
 */
const useHybridAppear = (itemCount: number, delayMs: number = 500) => {
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const [visibleItems, setVisibleItems] = useState(new Set<number>());
  const [hasScrolled, setHasScrolled] = useState(false); // 스크롤 감지 플래그

  // 1. 초기 화면 등장 (타이머) 로직
  useEffect(() => {
    // 모든 아이템에 대해 IO 감지를 시작하여, 처음 보이는 아이템들의 인덱스를 파악합니다.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = Number(entry.target.getAttribute('data-index'));
          
          if (entry.isIntersecting && !hasScrolled) {
            // ⭐ 화면에 처음 보이는 아이템(index 0부터)은 타이머로 순차 처리
            
            // 타이머가 동작하도록 visibleItems에 즉시 추가하지 않습니다.
            // 대신, 여기서 IO의 초기 감지 역할만 수행합니다.

            // 일단 화면에 보이는 아이템의 인덱스까지만 타이머가 작동하도록 로직을 변경합니다.
          } 
          
          // ⭐ 스크롤 후 등장 로직 (Below the Fold)
          if (entry.isIntersecting && hasScrolled) {
            // 스크롤이 시작되면 (hasScrolled = true), IO가 감지하는 대로 등장 처리
            setVisibleItems(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      // IO 감지 영역은 뷰포트 (rootMargin: '0px')
      { rootMargin: "0px", threshold: 0.1 } 
    );
    
    // 이 Hook은 타이머 로직과 IO 로직을 분리하는 것이 더 명확합니다.
    observer.disconnect(); // 기존 IO는 사용하지 않고 새로 만듭니다.

    // ----------------------------------------------------
    // ⭐ 초기 화면 아이템 개수 파악 및 타이머 설정
    // ----------------------------------------------------
    
    // 타이머가 필요한 아이템만 순차적으로 등장시키는 로직을 구현해야 합니다.
    let timerId: number;
    let currentIdx = 0;

    const tick = () => {
      if (currentIdx < itemCount && !hasScrolled) {
        setVisibleItems(prev => {
          const newSet = new Set(prev);
          newSet.add(currentIdx);
          return newSet;
        });
        currentIdx++;
        timerId = setTimeout(tick, delayMs);
      }
    };
    
    // 첫 아이템부터 타이머 시작
    timerId = setTimeout(tick, delayMs);
    
    // ----------------------------------------------------
    // ⭐ 스크롤 이벤트 감지 및 타이머 중지
    // ----------------------------------------------------

    const handleScroll = () => {
      // 스크롤이 발생하면, 초기 타이머 중지 및 hasScrolled 플래그 설정
      if (!hasScrolled) {
        clearTimeout(timerId);
        setHasScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll);


    // ----------------------------------------------------
    // ⭐ 스크롤 후 IO 재시작 (Below the Fold)
    // ----------------------------------------------------

    // 스크롤이 시작되면, 화면 밖의 아이템을 위한 IO를 다시 설정합니다.
    if (hasScrolled) {
      Object.values(itemRefs.current).forEach(el => {
        const index = Number(el?.getAttribute('data-index'));
        // 이미 타이머로 등장했거나, 아직 화면 밖에 있는 아이템만 IO로 감지 시작
        if (el && !visibleItems.has(index)) {
          observer.observe(el);
        }
      });
    }

    // 클린업 함수
    return () => {
      clearTimeout(timerId);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };

  }, [itemCount, delayMs, hasScrolled]);
  
  // itemRefs는 아이템을 렌더링할 때 설정해야 합니다.

  return { itemRefs, visibleItems };
};


// ... (LazyImage 컴포넌트 정의는 그대로 유지) ...


// ===============================================
// 3. Timeline 메인 컴포넌트
// ===============================================

export function Timeline() {
  const items: TimelineItem[] = useMemo(() => {
    // ... (기존 items 생성 로직) ...
    return imageKeys.map((key, i) => {
        const imgIndex = i + 1;
        const caption = captionMap.get(imgIndex);
        const hasCaption = Boolean(caption?.title || caption?.date || caption?.desc);
        return { imgIndex, key, caption, hasCaption };
    });
  }, []);

  // ⭐ 하이브리드 등장 Hook 사용 (등장 딜레이 500ms로 설정)
  const { itemRefs, visibleItems } = useHybridAppear(items.length, 500); 

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
              // ⭐ ref 및 data-index 설정 (IO 작동에 필수)
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
