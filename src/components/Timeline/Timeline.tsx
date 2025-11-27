import "./Timeline.scss";

type TimelineItem = {
  id: number;
  title: string;
  date: string;
  desc: string;
  img: string;
};

const items: TimelineItem[] = [
  {
    id: 1,
    title: "처음 만난 날",
    date: "2022.03",
    desc: "서로를 처음 알아가기 시작한 순간.",
    img: new URL("../../image/1.jpg", import.meta.url).href,
  },
  {
    id: 2,
    title: "첫 데이트",
    date: "2022.04",
    desc: "조금은 서툴지만 설레던 첫 데이트.",
    img: new URL("../../image/2.jpg", import.meta.url).href,
  },
  {
    id: 3,
    title: "첫 여행",
    date: "2022.08",
    desc: "둘만의 속도로 더 가까워진 시간.",
    img: new URL("../../image/3.jpg", import.meta.url).href,
  },
  {
    id: 4,
    title: "함께한 계절들",
    date: "2023",
    desc: "사계절을 지나며 쌓인 우리만의 추억.",
    img: new URL("../../image/4.jpg", import.meta.url).href,
  },
  {
    id: 5,
    title: "프로포즈",
    date: "2025.01",
    desc: "평생을 약속한 가장 빛나던 하루.",
    img: new URL("../../image/5.jpg", import.meta.url).href,
  },
  {
    id: 6,
    title: "결혼을 준비하며",
    date: "2025.11",
    desc: "같은 미래를 그리며 준비한 시간.",
    img: new URL("../../image/6.jpg", import.meta.url).href,
  },
];

export function Timeline() {
  return (
    <section className="w-timeline">
      <div className="section-inner">
        <h2 className="section-title">Our Timeline</h2>

        <ol className="timeline-list">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className={`timeline-item ${idx % 2 === 0 ? "left" : "right"}`}
            >
              <div className="line-col">
                <span className="dot" aria-hidden="true" />
                <span className="vline" aria-hidden="true" />
              </div>

              <article className="card">
                <div className="photo-wrap">
                  <img src={item.img} alt={item.title} loading="lazy" />
                </div>

                <div className="text-wrap">
                  <p className="date">{item.date}</p>
                  <h3 className="title">{item.title}</h3>
                  <p className="desc">{item.desc}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
