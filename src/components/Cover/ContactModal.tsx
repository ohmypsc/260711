import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./ContactModal.scss";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const contactInfo = useContactInfo();

  const groomSide = contactInfo.filter((c) => c.type === "groom");
  const brideSide = contactInfo.filter((c) => c.type === "bride");

  const formatPhoneLink = (phoneNumber: string): string => `tel:${phoneNumber}`;
  const formatSmsLink = (phoneNumber: string): string => `sms:${phoneNumber}`;

  // ✅ label 파라미터 추가 (신랑 측 / 신부 측 표시용)
  const renderSection = (list: typeof contactInfo, label: string) => (
    <div className="contact-group">
      <h3 className="group-label">{label}</h3>
      <div className="contact-card">
        {list.map((p, index) => (
          <div className="contact-item" key={p.id}>
            <div className="info-area">
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>
            </div>

            <div className="contact-actions">
              <a
                href={formatPhoneLink(p.phone)}
                className="action-btn phone"
                aria-label={`${p.name}님에게 전화 걸기`}
              >
                <i className="fas fa-phone-alt" />
              </a>

              <a
                href={formatSmsLink(p.phone)}
                className="action-btn sms"
                aria-label={`${p.name}님에게 문자메시지 보내기`}
              >
                <i className="fas fa-comment-dots" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <div className="contact-modal-wrap">
        <h2 className="modal-title">연락하기</h2>
        <p className="modal-subtitle contact-subtitle">
          전화, 메시지로 축하의 마음을 전해 주세요.
        </p>

        <div className="contact-body">
          {renderSection(groomSide, "신랑 측")}
          {renderSection(brideSide, "신부 측")}
        </div>
      </div>
    </Modal>
  );
}
