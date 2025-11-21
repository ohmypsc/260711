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
        {/* 메인 제목 이모티콘도 따뜻한 색상으로 변경 
            (브라우저 환경에 따라 색상이 결정되지만, 무드에 맞는 이모티콘 사용) */}
        <h2 className="contact-title">💍 웨딩 연락처 안내</h2>

        {/* --- 신랑측 섹션 --- */}
        <div className="contact-section">
          <h3 className="side-title">신랑측 혼주 / 연락처</h3>
          
          {groomSide.map((p) => (
            <div className="contact-item" key={p.id}>
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>
              
              <div className="contact-actions">
                {/* 📞 전화 걸기 아이콘 */}
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  <i className="fas fa-phone-alt"></i> 
                </a>

                {/* 💬 문자메시지 아이콘 */}
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

        {/* --- 신부측 섹션 --- */}
        <div className="contact-section">
          <h3 className="side-title">신부측 혼주 / 연락처</h3>

          {brideSide.map((p) => (
            <div className="contact-item" key={p.id}>
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>

              <div className="contact-actions">
                {/* 📞 전화 걸기 아이콘 */}
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  <i className="fas fa-phone-alt"></i> 
                </a>

                {/* 💬 문자메시지 아이콘 */}
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
