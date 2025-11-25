import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./ContactModal.scss";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const contactInfo = useContactInfo();

  const groomSide = contactInfo.filter((c) => c.type === "groom");
  const brideSide = contactInfo.filter((c) => c.type === "bride");

  const formatPhoneLink = (phoneNumber: string): string => `tel:${phoneNumber}`;
  const formatSmsLink = (phoneNumber: string): string => `sms:${phoneNumber}`;

  const renderSection = (list: typeof contactInfo) => (
    <div className="contact-section">
      {list.map((p) => (
        <div className="contact-item" key={p.id}>
          <span className="relation">{p.relation}</span>
          <span className="name">{p.name}</span>

          <div className="contact-actions">
            <a
              href={formatPhoneLink(p.phone)}
              className="icon-link"
              aria-label={`${p.name}님에게 전화 걸기`}
            >
              <i className="fas fa-phone-alt" />
            </a>

            <a
              href={formatSmsLink(p.phone)}
              className="icon-link"
              aria-label={`${p.name}님에게 문자메시지 보내기`}
            >
              <i className="fas fa-comment-dots" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <div className="contact-modal-wrap">
        {/* ✅ 전역 타이틀/부제목만 사용 */}
        <h2 className="modal-title">연락하기</h2>
        <p className="modal-subtitle contact-subtitle">
          전화, 문자 메시지로 축하 인사를 전해 보세요.
        </p>

        {renderSection(groomSide)}
        {renderSection(brideSide)}
      </div>
    </Modal>
  );
}
