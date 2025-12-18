import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import "./Timeline.scss";

/** Vite: 이미지 로드 로직 */
const imageModules = import.meta.glob("/src/image/*.jpg", {
  eager: false,
  import: "default",
}) as Record<string, () => Promise<string>>;

const imageKeys = Object.keys(imageModules).sort((a, b) => {
  const na = Number(a.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  const nb = Number(b.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  return na - nb;
});

type Caption = {
  imgIndex: number;
  title?: ReactNode;
};

const captions: Caption[] = [
  { imgIndex: 1, title: <span className="no-break">1989년에 태어난 승철이와</span> },
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

const useFontLoaded = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setLoaded(true));
  }, []);
  return loaded;
};

const useHybridTimelineAppear = (itemCount: number, initialDelayMs: number = 500) => {
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const [visibleItems, setVisibleItems] = useState(new Set<number>());

  useEffect(() => {
    let timerId: number | undefined;
    let initialVisibleIndices: number[] = [];
    
    const initialObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.getAttribute("data-index"));
        if (entry.isIntersecting) initialVisibleIndices.push(index);
      });
      obs.disconnect();
      initialVisibleIndices.sort((a, b) => a - b);
      
      let currentTimerIndex = 0;
      const startInitialTimer = () => {
        if (currentTimerIndex < initialVisibleIndices.length) {
          setVisibleItems(prev => new Set(prev).add(initialVisibleIndices[currentTimerIndex++]));
          timerId = window.setTimeout(startInitialTimer, initialDelayMs);
        } else {
          startScrollObserver();
        }
      };

      const startScrollObserver = () => {
        const scrollObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = Number(entry.target.getAttribute("data-index"));
              setVisibleItems(prev => new Set(prev).add(index));
            }
          });
        }, { threshold: 0.1 });
        Object.values(itemRefs.current).forEach(el => el && scrollObserver.observe(el));
      };
      startInitialTimer();
    }, { threshold: 0.1 });

    Object.values(itemRefs.current).forEach(el => el && initialObserver.observe(el));
    return () => clearTimeout(timerId);
  }, [itemCount, initialDelayMs]);

  return { itemRefs, visibleItems };
};

/**
 * ✅ 수정된 AutoFitTitle: 부모 너비를 물리적으로 고정된 상태에서 측정
 */
function AutoFitTitle({ children, watchKey }: { children: ReactNode; watchKey: string }) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const [fontSize, setFontSize] = useState<string>("");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.fontSize = ""; 
      const parent = el.parentElement;
      if (!parent) return;

      // getBoundingClientRect는 소수점까지 포함한 실제 렌더링 너비를 가져옴
      const parentWidth = parent.getBoundingClientRect().width;
      const ps = window.getComputedStyle(parent);
      const paddingX = parseFloat(ps.paddingLeft) + parseFloat(ps.paddingRight);
      const containerWidth = parentWidth - paddingX;

      const textWidth = el.scrollWidth;
      const currentFontSize = parseFloat(window.getComputedStyle(el).fontSize);

      if (containerWidth > 0 && textWidth > containerWidth) {
        // 0.95 안전 계수를 두어 글자가 경계면에 닿지 않게 함
        const nextSize = (currentFontSize * (containerWidth / textWidth)) * 0.95;
        setFontSize(`${nextSize}px`);
      } else {
        setFontSize("");
      }
    };

    // 레이아웃 지연을 고려하여 2중 보정
    const timeout = setTimeout(() => requestAnimationFrame(fit), 30);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    return () => {
      clearTimeout(timeout);
      ro.disconnect();
    };
  }, [watchKey, children]);

  return (
    <h3 
      ref={ref} 
      className="title" 
      style={{ 
        fontSize: fontSize || undefined, 
        whiteSpace: "nowrap",
        display: "block",
        width: "100%"
      }}
    >
      {children}
    </h3>
  );
}

function LazyImage({ srcPromise, alt, aboveFold = false }: { srcPromise: () => Promise<string>; alt: string; aboveFold?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(aboveFold);
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (aboveFold) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShouldLoad(true); io.disconnect(); }
    }, { rootMargin: "600px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [aboveFold]);

  useEffect(() => {
    if (shouldLoad && !src) srcPromise().then(url => setSrc(url));
  }, [shouldLoad, src, srcPromise]);

  return (
    <div ref={ref} className={`lazy-photo ${loaded ? "is-loaded" : "is-loading"}`} aria-label={alt}>
      {!loaded && <div className="photo-skeleton" aria-hidden="true" />}
      {src && <img src={src} alt={alt} onLoad={() => setLoaded(true)} loading={aboveFold ? "eager" : "lazy"} />}
    </div>
  );
}

export function Timeline() {
  const items = useMemo(() => imageKeys.map((key, i) => ({
    imgIndex: i + 1,
    key,
    caption: captionMap.get(i + 1),
    hasCaption: !!captionMap.get(i + 1)?.title
  })), []);

  const { itemRefs, visibleItems } = useHybridTimelineAppear(items.length, 500);
  const isFontLoaded = useFontLoaded();

  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {items.map((item, idx) => {
          const isVisible = visibleItems.has(idx);
          const side = idx % 2 === 0 ? "left" : "right";
          return (
            <li
              key={item.imgIndex}
              ref={(el) => (itemRefs.current[idx] = el)}
              data-index={idx}
              className={`timeline-item ${side} ${isVisible ? "is-visible" : "not-visible"}`}
            >
              <div className="line-col"><span className="dot" aria-hidden="true" /></div>
              <div className="media">
                <div className="photo-wrap">
                  <LazyImage srcPromise={imageModules[item.key]} alt={`img-${item.imgIndex}`} aboveFold={item.imgIndex <= 2} />
                </div>
              </div>
              {item.hasCaption && (
                <div className="caption-col">
                  <AutoFitTitle watchKey={`${idx}-${isVisible}-${isFontLoaded}`}>
                    {item.caption?.title}
                  </AutoFitTitle>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
