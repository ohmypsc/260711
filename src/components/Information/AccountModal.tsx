import { useState } from "react";

export function AccountModal({ onClose, brideInfo, groomInfo }) {
  const [copied, setCopied] = useState("");

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);

    setTimeout(() => {
      setCopied("");
    }, 1500);
  };

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <h2>계좌번호 안내</h2>

        {[...brideInfo, ...groomInfo].map((person) => (
          <div key={person.name} className="account-item">
            <div className="account-title">{person.relation} · {person.name}</div>
            <div className="account-number">{person.account}</div>

            <button onClick={() => copyText(person.account)} className="copy-btn">
              {copied === person.account ? "✔ 복사됨!" : "복사하기"}
            </button>
          </div>
        ))}

        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
