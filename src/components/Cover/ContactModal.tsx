import { useContext } from "react";
import { ContactInfoContext } from "@/ContactInfoProvider";
import { Modal } from "@/components/common/Modal/Modal";
import "./ContactModal.scss";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const contactInfo = useContext(ContactInfoContext);

  const groomSide = contactInfo.filter((c) => c.type === "groom");
  const brideSide = contactInfo.filter((c) => c.type === "bride");

  return (
    <ModalBase onClose={onClose}>
      <div className="contact-modal-wrap">
        <h2 className="contact-title">연락처</h2>

        <h3 className="side-title">신랑측</h3>
        {groomSide.map((p) => (
          <div className="contact-item" key={p.id}>
            <span className="relation">{p.relation}</span>
            <span className="name">{p.name}</span>
            <a href={`tel:${p.phone}`} className="phone">
              {p.phone}
            </a>
          </div>
        ))}

        <h3 className="side-title">신부측</h3>
        {brideSide.map((p) => (
          <div className="contact-item" key={p.id}>
            <span className="relation">{p.relation}</span>
            <span className="name">{p.name}</span>
            <a href={`tel:${p.phone}`} className="phone">
              {p.phone}
            </a>
          </div>
        ))}
      </div>
    </ModalBase>
  );
}
