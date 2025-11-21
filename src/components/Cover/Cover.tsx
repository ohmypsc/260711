import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { ContactModal } from "@/components/Cover/ContactModal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./Cover.scss";

export function Cover() {
  const [open, setOpen] = useState(false);

  // 📌 전체 contactInfo 받아오기
  const contactInfo = useContactInfo();

  // 🟦 신랑/신부/부모님 정보 찾기
  const groom = contactInfo.find((c) => c.id === "groom");
  const bride = contactInfo.find((c) => c.id === "bride");
  const groomFather = contactInfo.find((c) => c.id === "groom-father");
  const groomMother = contactInfo.find((c) => c.id === "groom-mother");
  const brideFather = contactInfo.find((c) => c.id === "bride-father");
  const brideMother = contactInfo.find((c) => c.id === "bride-mother");

  return (
    <div className="w-cover">

      <h1 className="names">
        {groom?.name} <span>&</span> {bride?.name}
      </h1>

      <p className="date">2026.07.11 (토) 오전 11시</p>
      <p className="place">유성컨벤션웨딩홀 3층 그랜드홀</p>

      <div className="parents">
        <p>
          {groomFather?.name} · {groomMother?.name}의{" "}
          <span className="relation-name relation-name--adjust">아들</span>{" "}
          <strong>{groom?.name}</strong>
        </p>

        <p className="daughter">
          {brideFather?.name} · {brideMother?.name}의{" "}
          <span className="relation-name relation-name--adjust">딸</span>{" "}
          <strong>{bride?.name}</strong>
        </p>
      </div>

      <Button variant="outline" onClick={() => setOpen(true)}>
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </div>
  );
}
