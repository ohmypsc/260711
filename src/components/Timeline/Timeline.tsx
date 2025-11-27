import "./Timeline.scss";

/** Vite: src/image 안 jpg 자동 로드 */
const imageModules = import.meta.glob("/src/image/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const images = Object.keys(imageModules)
  .sort((a, b) => {
    const na = Number(a.match(/(\d+)\.jpg$/)?.[1] ?? 0);
    const nb = Number(b.match(/(\d+)\.jpg$/)?.[1] ?? 0);
    return na - nb;
  })
  .map((k) => imageModules[k]);

type Caption = {
  imgIndex: number; // 1-based
  title?: string;
  date?: string;
  desc?: string;
};

const captions: Caption[] = [
  { imgIndex: 1, title: "2024년 가을" },
  { imgIndex: 3, title: "2025년 봄" },
  { imgIndex: 5, title: "2025년 가을" },
];

const captionMap = new Map<number, Caption>(captions.map((c) => [c.imgIndex, c]));

type TimelineItem = {
  imgIndex: number;
  img: string;
  caption?: Caption;
  hasCaption: boolean;
};

const items: TimelineItem[] = images.map((img, i) => {
  const imgIndex = i + 1;
  const caption = captionMap.get(imgIndex);
  const hasCaption = Boolean(caption?.title || caption?.date || caption?.desc);
  return { imgIndex, img, caption, hasCaption };
});

export function Timeline() {
  return (
    <div className="w-timeline">
      <h2 className="section-title">우리의 시간</h2>

      <ol className="timeline-list">
        {items.map((item, idx) => {
          const side = idx % 2 === 0 ? "left" : "right";

          return (
            <li key={item.imgIndex} className={`timeline-item ${side}`}>
              {/* 가운데 라인 */}
              <div className="line-col">
                <span className="dot" aria-hidden="true" />
              </div>

              {/* 사진 */}
              <div className="media">
                <div className="photo-wrap">
                  <img
                    src={item.img}
                    alt={item.caption?.title ?? `timeline-${item.imgIndex}`}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* 캡션(반대편 칼럼) */}
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
