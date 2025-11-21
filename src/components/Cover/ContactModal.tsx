import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./ContactModal.scss";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const contactInfo = useContactInfo();

  const groomSide = contactInfo.filter((c) => c.type === "groom");
  const brideSide = contactInfo.filter((c) => c.type === "bride");
  
  // 전화번호에 'tel:' 접두사를 붙여 전화 걸기 링크를 만듭니다.
  const formatPhoneLink = (phoneNumber: string): string => {
    return `tel:${phoneNumber}`;
  };

  // ✅ 전화번호에 'sms:' 접두사를 붙여 문자메시지 링크를 만듭니다.
  const formatSmsLink = (phoneNumber: string): string => {
    return `sms:${phoneNumber}`;
  };

  return (
    <Modal onClose={onClose}>
      <div className="contact-modal-wrap">
        {/* 메인 제목 */}
        <h2 className="contact-title">🤵👰🏻 축하 인사하기</h2>

        {/* --- 신랑측 섹션 --- */}
        <div className="contact-section">
          <h3 className="side-title">신랑 측</h3>
          
          {groomSide.map((p) => (
            <div className="contact-item" key={p.id}>
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>
              
              {/* ✅ 전화 및 문자메시지 아이콘 영역 (call-button 대신 contact-actions 사용) */}
              <div className="contact-actions">
                {/* 📞 전화 걸기 아이콘 */}
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  <i className="fas fa-phone-alt"></i> 
                </a>

                {/* 💬 문자메시지 아이콘 (추가됨) */}
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
          <h3 className="side-title">신부 측</h3>

          {brideSide.map((p) => (
            <div className="contact-item" key={p.id}>
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>

              {/* ✅ 전화 및 문자메시지 아이콘 영역 */}
              <div className="contact-actions">
                {/* 📞 전화 걸기 아이콘 */}
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  <i className="fas fa-phone-alt"></i> 
                </a>

                {/* 💬 문자메시지 아이콘 (추가됨) */}
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
