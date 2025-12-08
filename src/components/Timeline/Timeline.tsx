
import React, { useState, useEffect } from "react";
import "./Timeline.scss";

/** Vite: src/image 안 jpg 동적 로드 */
const imageModules = import.meta.glob("/src/image/*.jpg", {
  import: "default",
});

type Caption = {
  imgIndex: number; // 1-based
  title?: string;
  date?: string;
  desc?: string;
};

const captions: Caption[] = [
  { imgIndex: 1, title: "1989년 가을에 태어난 승철이와" },
  { imgIndex: 2, title: "1990년 봄에 태어난 미영이가" },
  { imgIndex: 3, title: "2024년 가을에 만나" },
  { imgIndex: 4, title: "2024년 겨울," },
  { imgIndex: 5, title: "2025년 봄," },
  { imgIndex: 6, title: "2025년 여름," },
  { imgIndex: 7, title: "2025년 가을," },
  { imgIndex: 8, title: "2025년 겨울," },
  { imgIndex: 9, title: "2026년 봄을 지나" },
];

const captionMap = new Map<number, Caption>(captions.map((c) => [c.imgIndex, c]));

const sortedKeys = Object.keys(imageModules).sort((a, b) => {
  const na = Number(a.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  const nb = Number(b.match(/(\d+)\.jpg$/)?.[1] ?? 0);
  return na - nb;
});

type ItemWithPromise = {
  imgIndex: number;
  imgPromiseLoader: () => Promise<{ default: string }>;
  caption?: Caption;
  hasCaption: boolean;
};

const itemsWithPromise: ItemWithPromise[] = sortedKeys.map((k, i) => {
  const imgIndex = i + 1;
  const caption = captionMap.get(imgIndex);
  const hasCaption = Boolean(caption?.title || caption?.date || caption?.desc);
  return {
    imgIndex,
    imgPromiseLoader: imageModules[k] as () => Promise<{ default: string }>,
    caption,
    hasCaption,
  };
});

// 이미지 로딩을 처리하는 내부 컴포넌트
const LazyTimelineImage: React.FC<ItemWithPromise & { loading: 'lazy' | 'eager' }> = ({
  imgIndex,
  imgPromiseLoader,
  caption,
  loading,
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    imgPromiseLoader()
      .then((module) => {
        setImgSrc(module.default);
      })
      .catch((error) => {
        console.error(`Error loading image ${imgIndex}:`, error);
      });
  }, [imgPromiseLoader, imgIndex]);

  if (!imgSrc) {
    return (
      <div
        className="photo-placeholder"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--text-light)',
          borderRadius: '50%',
        }}
      ></div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={caption?.title ?? `timeline-${imgIndex}`}
      loading={loading}
    />
  );
};

export function Timeline() {
  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {itemsWithPromise.map((item, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";
          const loadingAttr = idx === 0 ? 'eager' : 'lazy';

          return (
            <li key={item.imgIndex} className={`timeline-item ${side}`}>
              <div className="line-col">
                <span className="dot" aria-hidden="true" />
              </div>

              <div className="media">
                <div className="photo-wrap">
                  <LazyTimelineImage
                    {...item}
                    loading={loadingAttr}
                  />
                </div>
              </div>

              {item.hasCaption && (
                <div className="caption-col">
                  {item.caption?.date && <p className="date">{item.caption.date}</p>}
                  {item.caption?.title && <h3 className="title">{item.caption.title}</h3>}
                  {item.caption?.desc && <p className="desc">{item.caption.desc}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
