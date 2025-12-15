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

/** ✅ 모든 타이틀을 no-break span으로 감쌈 */
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
    {
        imgIndex: 3,
        title: (
            <>
                <span className="no-break">2024년 가을에 만나</span>
            </>
        ),
    },
    {
        imgIndex: 4,
        title: (
            <>
                <span className="no-break">2024년 겨울,</span>
            </>
        ),
    },
    {
        imgIndex: 5,
        title: (
            <>
                <span className="no-break">2025년 봄,</span>
            </>
        ),
    },
    {
        imgIndex: 6,
        title: (
            <>
                <span className="no-break">2025년 여름,</span>
            </>
        ),
    },
    {
        imgIndex: 7,
        title: (
            <>
                <span className="no-break">2025년 가을,</span>
            </>
        ),
    },
    {
        imgIndex: 8,
        title: (
            <>
                <span className="no-break">2025년 겨울,</span>
            </>
        ),
    },
    {
        imgIndex: 9,
        title: (
            <>
                <span className="no-break">2026년 봄을 지나</span>
            </>
        ),
    },
];

const captionMap = new Map<number, Caption>(captions.map((c) => [c.imgIndex, c]));

type TimelineItem = {
    imgIndex: number;
    key: string; // glob key
    caption?: Caption;
    hasCaption: boolean;
};

// ===============================================
// ⭐ NEW: 하이브리드 등장 애니메이션을 위한 Hook (유지)
// ===============================================

/**
 * 초기 뷰포트 아이템은 타이머로, 나머지 아이템은 스크롤(IO)로 제어하는 Hook
 */
const useHybridTimelineAppear = (itemCount: number, initialDelayMs: number = 500) => {
    const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
    const [visibleItems, setVisibleItems] = useState(new Set<number>());

    useEffect(() => {
        let timerId: number | undefined;
        let initialVisibleIndices: number[] = [];
        let initialObserver: IntersectionObserver | null = null;
        let scrollObserver: IntersectionObserver | null = null;
        
        // ------------------------------------------
        // A. 초기 감지: 페이지 로드 시 화면에 보이는 아이템 인덱스 수집
        // ------------------------------------------

        initialObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach(entry => {
                    const index = Number(entry.target.getAttribute('data-index'));
                    if (entry.isIntersecting) {
                        initialVisibleIndices.push(index);
                    }
                });
                
                obs.disconnect(); // 초기 감지 역할이 끝나면 중지
                
                // ------------------------------------------
                // B. 초기 아이템 타이머로 순차 등장 시작 (스르륵 효과)
                // ------------------------------------------
                
                // 인덱스를 오름차순으로 정렬
                initialVisibleIndices.sort((a, b) => a - b);  
                let currentTimerIndex = 0;

                const startInitialTimer = () => {
                    if (currentTimerIndex < initialVisibleIndices.length) {
                        const indexToReveal = initialVisibleIndices[currentTimerIndex];
                        setVisibleItems(prev => {
                            const newSet = new Set(prev);
                            newSet.add(indexToReveal);
                            return newSet;
                        });
                        currentTimerIndex++;
                        timerId = setTimeout(startInitialTimer, initialDelayMs) as unknown as number;
                    } else {
                        // 타이머가 끝나면, 남은 아이템에 대해 스크롤 감지 시작
                        startScrollObserver();
                    }
                };
                startInitialTimer();


                // ------------------------------------------
                // C. 화면 밖 아이템은 스크롤로 감지 시작 (이어서 등장)
                // ------------------------------------------
                const startScrollObserver = () => {
                        scrollObserver = new IntersectionObserver(
                            (entries, observer) => {
                                entries.forEach(entry => {
                                    const index = Number(entry.target.getAttribute('data-index'));
                                    
                                    if (entry.isIntersecting) {
                                        // 이미 타이머로 등장했거나, Set에 있으면 무시
                                        if (visibleItems.has(index)) return; 

                                        setVisibleItems(prev => {
                                            const newSet = new Set(prev);
                                            newSet.add(index);
                                            return newSet;
                                        });
                                        observer.unobserve(entry.target);
                                    }
                                });
                            },
                            // 스크롤 시 등장이므로 rootMargin을 0px로 유지
                            { rootMargin: "0px", threshold: 0.1 } 
                        );

                        // 초기 화면에 포함되지 않았던 아이템만 IO 관찰 대상으로 등록
                        Object.values(itemRefs.current).forEach(el => {
                            const index = Number(el?.getAttribute('data-index'));
                            // 초기 감지 인덱스에 포함되지 않았던 항목들만 관찰 시작
                            if (el && !initialVisibleIndices.includes(index)) {
                                scrollObserver!.observe(el);
                            }
                        });
                };
            },
            // IO 감지 영역: 뷰포트에 들어왔을 때만 (0px) 감지
            { rootMargin: "0px", threshold: 0.1 } 
        );


        // 모든 타임라인 아이템을 초기 감지 대상으로 등록
        Object.values(itemRefs.current).forEach(el => {
            if (el) initialObserver!.observe(el);
        });

        // 클린업
        return () => {
            clearTimeout(timerId);
            initialObserver?.disconnect();
            scrollObserver?.disconnect();
        };

    }, [itemCount, initialDelayMs]);

    return { itemRefs, visibleItems };
};

// ===============================================
// ⭐ 최종 개선: 최소 폰트 크기 제한 제거 (무조건 한 줄에 맞춤)
// ===============================================

/**
 * 텍스트 내용이 부모 컨테이너를 넘칠 경우, 글자 크기를 조절하여 한 줄에 맞춥니다.
 */
const useAutoResizeText = (
    ref: React.RefObject<HTMLHeadingElement>,
    itemIndex: number,
    hasCaption: boolean
) => {
    const [fontSize, setFontSize] = useState<string>('inherit');
    // 글자 크기가 바뀔 때마다 다시 측정하도록 유도하는 카운터
    const [recheckCount, setRecheckCount] = useState(0); 

    // 1. 뷰포트 변경 감지 이벤트 추가 (모바일 대응)
    useEffect(() => {
        if (!hasCaption) return;

        const handleResize = () => {
            // 창 크기 변경(모바일 회전, 키보드 등장 등) 시 재측정을 강제합니다.
            setFontSize('inherit'); 
            setRecheckCount(c => c + 1);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
        
    }, [hasCaption]); // 초기 마운트 시 한 번만 등록


    // 2. 글자 크기 계산 로직
    useEffect(() => {
        if (!hasCaption) return;

        const parentElement = ref.current;
        const textElement = parentElement?.children[0] as HTMLElement | undefined;

        if (!parentElement || !textElement) return;

        const adjustFontSize = () => {
            
            // 텍스트를 측정하기 위해 일시적으로 기본 크기(1rem)로 설정합니다.
            if (fontSize !== 'inherit') {
                parentElement.style.fontSize = '1rem';
            }

            const textWidth = textElement.getBoundingClientRect().width;
            const parentWidth = parentElement.getBoundingClientRect().width;
            
            let currentFontSize = parseFloat(window.getComputedStyle(textElement).fontSize);
            // ⭐ minFontSize 제한을 완전히 제거합니다.
            const paddingTolerance = 0.95; 

            // 텍스트가 부모 컨테이너를 넘치는지 확인
            if (textWidth > parentWidth && parentWidth > 0) {
                // 넘치는 경우, 비율에 맞춰 글자 크기 조절 (제한 없음)
                const newFontSize = currentFontSize * (parentWidth / textWidth) * paddingTolerance;

                const newFontSizeString = `${newFontSize}px`;
                if (fontSize !== newFontSizeString) {
                    setFontSize(newFontSizeString);
                    // 폰트 크기가 변경되었으므로, 다음 렌더링 후 다시 측정하도록 유도
                    setRecheckCount(c => c + 1); 
                }
            } else {
                // 넘치지 않으면 기본 크기 'inherit' 설정
                if (fontSize !== 'inherit') {
                    setFontSize('inherit');
                }
            }
            
            // 임시로 변경했던 스타일을 초기 상태로 되돌림
            if (fontSize !== 'inherit') {
                parentElement.style.fontSize = ''; 
            }
        };

        // DOM이 안정화된 후 측정 실행
        const rafId = requestAnimationFrame(adjustFontSize);

        return () => {
            cancelAnimationFrame(rafId);
        };
        
    // fontSize나 recheckCount가 변하면 Hook을 재실행하여 재측정
    }, [itemIndex, hasCaption, ref, fontSize, recheckCount]); 

    return { fontSize };
};


/**
 * ✅ 체감 lazy 개선 버전 LazyImage (기존 로직 그대로 유지)
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

    // IO로 "근처 오면" 로드 시작
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

    const { itemRefs, visibleItems } = useHybridTimelineAppear(items.length, 500); 

    return (
        <div className="w-timeline">
            <ol className="timeline-list">
                {items.map((item, idx) => {
                    const side = idx % 2 === 0 ? "left" : "right";
                    const cap = item.caption;
                    
                    const capRef = useRef<HTMLHeadingElement | null>(null);

                    // ⭐ NEW: 자동 크기 조절 Hook 적용 (제한 없음)
                    const { fontSize } = useAutoResizeText(capRef, idx, item.hasCaption);
                    
                    const isVisible = visibleItems.has(idx);

                    return (
                        <li 
                            key={item.imgIndex} 
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
                                        alt={typeof cap?.title === 'string' ? cap.title : `timeline-${item.imgIndex}`}
                                        aboveFold={item.imgIndex <= 2}
                                    />
                                </div>
                            </div>

                            {/* 캡션 */}
                            {item.hasCaption && (
                                <div className="caption-col">
                                    {cap?.date && <p className="date">{cap.date}</p>}
                                    {cap?.title && (
                                        <h3 
                                            className="title"
                                            // ⭐ ref 및 계산된 스타일 적용
                                            ref={capRef}
                                            // fontSize를 계산된 크기로 적용하며, 줄 바꿈 방지 속성 유지
                                            style={{ fontSize: fontSize, whiteSpace: 'nowrap' }} 
                                        >
                                            {cap.title}
                                        </h3>
                                    )}
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
