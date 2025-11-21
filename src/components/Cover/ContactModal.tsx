import { Modal } from "@/components/common/Modal/Modal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./ContactModal.scss";

// Font Awesome 아이콘을 사용하려면, HTML <head>에 CDN이 추가되어 있어야 합니다.

export function ContactModal({ onClose }: { onClose: () => void }) {
  const contactInfo = useContactInfo();

  const groomSide = contactInfo.filter((c) => c.type === "groom");
  const brideSide = contactInfo.filter((c) => c.type === "bride");
  
  // 전화번호에 하이픈이 없다고 가정하고, 'tel:' 접두사만 붙이는 간단한 함수
  const formatPhoneLink = (phoneNumber: string): string => {
    return `tel:${phoneNumber}`;
  };

  return (
    <Modal onClose={onClose}>
      <div className="contact-modal-wrap">
        {/* 메인 제목 */}
        <h2 className="contact-title">🤵👰🏻 연락처 안내</h2>

        {/* --- 신랑측 섹션 --- */}
        <div className="contact-section">
          <h3 className="side-title">신랑측 혼주 / 연락처</h3>
          
          {groomSide.map((p) => (
            <div className="contact-item" key={p.id}>
              <span className="relation">{p.relation}</span>
              <span className="name">{p.name}</span>
              
              {/* 전화번호 텍스트 대신 아이콘 버튼 영역으로 대체 */}
              <div className="call-button">
                {/* 'tel:' 링크를 걸고, 클래스 (.phone-icon-link)를 적용합니다. */}
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="phone-icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  {/* Font Awesome 아이콘 삽입 */}
                  <i className="fas fa-phone-alt"></i> 
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

              {/* 전화번호 텍스트 대신 아이콘 버튼 영역으로 대체 */}
              <div className="call-button">
                {/* 'tel:' 링크를 걸고, 클래스 (.phone-icon-link)를 적용합니다. */}
                <a 
                  href={formatPhoneLink(p.phone)} 
                  className="phone-icon-link"
                  aria-label={`${p.name}님에게 전화 걸기`}
                >
                  {/* Font Awesome 아이콘 삽입 */}
                  <i className="fas fa-phone-alt"></i> 
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
