import "./Timeline.scss";

/**
 * ✅ Vite: src/image 폴더의 jpg 자동 로드
 * - 1.jpg, 2.jpg, 3.jpg ... 숫자 순으로 정렬
 */
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

/**
 * ✅ 캡션(선택)
 * - imgIndex는 1부터 시작 (1.jpg → 1)
 * - 필요한 사진에만 넣고, 나머지는 빼면 됨
 */
type Caption = {
  imgIndex: number; // 1-based
  title?: string;
  date?: string;
  desc?: string;
};

const captions: Caption[] = [
  { imgIndex: 1, title: "처음 만난 날", date: "2022.03", desc: "서로를 처음 알아가기 시작한 순간." },
  { imgIndex: 2, title: "첫 데이트", date: "2022.04" },
  // 3번 사진은 캡션 없이 "사진만" 나오게 하고 싶으면 안 넣으면 됨
  { imgIndex: 4, title: "함께한 계절들", date: "2023", desc: "사계절을 지나며 쌓인 우리만의 추억." },
  // { imgIndex: 7, title: "..."} 이런 식으로 나중에 추가
];

/** captions를 빠르게 찾기 위한 Map */
const captionMap = new Map<number, Caption>(
  captions.map((c) => [c.imgIndex, c])
);

type TimelineItem = {
  imgIndex: number;
  img: string;
  caption?: Caption;
  hasCaption: boolean;
};

const items: TimelineItem[] = images.map((img, i) => {
  const imgIndex = i + 1; // 1-based
  const caption = captionMap.get(imgIndex);
  const hasCaption = Boolean(caption?.title || caption?.date || caption?.desc);

  return { imgIndex, img, caption, hasCaption };
});

export function Timeline() {
  return (
    <div className="w-timeline">
      <ol className="timeline-list">
        {items.map((item, idx) => (
          <li
            key={item.imgIndex}
            className={`timeline-item ${idx % 2 === 0 ? "left" : "right"} ${
              item.hasCaption ? "with-caption" : "no-caption"
            }`}
          >
            <div className="line-col">
              <span className="dot" aria-hidden="true" />
              <span className="vline" aria-hidden="true" />
            </div>

            <article className="card">
              <div className="photo-wrap">
                <img src={item.img} alt={item.caption?.title ?? `timeline-${item.imgIndex}`} loading="lazy" />
              </div>

              {/* ✅ 캡션이 있는 사진만 텍스트 출력 */}
              {item.hasCaption && (
                <div className="text-wrap">
                  {item.caption?.date && <p className="date">{item.caption.date}</p>}
                  {item.caption?.title && <h3 className="title">{item.caption.title}</h3>}
                  {item.caption?.desc && <p className="desc">{item.caption.desc}</p>}
                </div>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
