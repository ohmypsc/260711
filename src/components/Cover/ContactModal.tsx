import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./ContactModal.scss";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const contactInfo = useContactInfo();

  const groomSide = contactInfo.filter((c) => c.type === "groom");
  const brideSide = contactInfo.filter((c) => c.type === "bride");
  
  const formatPhoneLink = (phoneNumber: string): string => {
    return `tel:${phoneNumber}`;
  };

  const formatSmsLink = (phoneNumber: string): string => {
    return `sms:${phoneNumber}`;
  };

  return (
    <Modal onClose={onClose}>
      <div className="contact-modal-wrap">
        <h2 className="contact-title">💍연락하기</h2>

        <div className="contact-section">
          
          {groomSide.map((p) => (
            <div className="contact-item" key={p.id}>
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>
              
              <div className="contact-actions">
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  <i className="fas fa-phone-alt"></i> 
                </a>

                <a 
                  href={formatSmsLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 문자메시지 보내기`}
                >
                  <i className="fas fa-comment-dots"></i> 
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-section">

          {brideSide.map((p) => (
            <div className="contact-item" key={p.id}>
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>

              <div className="contact-actions">
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  <i className="fas fa-phone-alt"></i> 
                </a>

                <a 
                  href={formatSmsLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 문자메시지 보내기`}
                >
                  <i className="fas fa-comment-dots"></i> 
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
