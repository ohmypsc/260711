import { useEffect, useRef, useState, ReactNode } from "react";
import "./FadeIn.scss";

interface FadeInProps {
  children: ReactNode;
  delay?: number;      // 등장 지연 시간 (ms 단위, 기본 0)
  threshold?: number;  // 화면에 얼마나 보일 때 등장할지 (0.0 ~ 1.0, 기본 0.1)
  className?: string;  // 추가적인 스타일 클래스가 필요할 경우를 대비
}

export function FadeIn({ 
  children, 
  delay = 0, 
  threshold = 0.1,
  className = "" 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 화면에 들어왔고(isIntersecting) + 아직 안 보여진 상태라면
          if (entry.isIntersecting) {
            setIsVisible(true);
            // 한 번 보이면 관찰 중단 (성능 최적화 & 깜빡임 방지)
            const element = domRef.current;
            if (element) observer.unobserve(element);
          }
        });
      },
      { threshold } // 기본 10% 정도 보이면 실행
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
