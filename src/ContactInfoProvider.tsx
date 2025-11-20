import { createContext, useContext } from "react";

const ContactInfoContext = createContext([]);

export function ContactInfoProvider({ children }) {
  // 🔥 GitHub Secrets → .env.production → import.meta.env 로 들어오는 개인정보
  const contactInfo = [
    // 🟦 신랑 본인
    {
      id: "groom",
      type: "groom",
      relation: "신랑",
      name: import.meta.env.VITE_GROOM_NAME,
      phone: import.meta.env.VITE_GROOM_PHONE,
      bank: import.meta.env.VITE_GROOM_BANK,
      account: import.meta.env.VITE_GROOM_ACCOUNT,
    },

    // 👨‍👦 신랑 아버지
    {
      id: "groom-father",
      type: "groom",
      relation: "신랑 아버지",
      name: import.meta.env.VITE_GROOM_FATHER_NAME,
      phone: import.meta.env.VITE_GROOM_FATHER_PHONE,
      bank: import.meta.env.VITE_GROOM_FATHER_BANK,
      account: import.meta.env.VITE_GROOM_FATHER_ACCOUNT,
    },

    // 👩‍👦 신랑 어머니
    {
      id: "groom-mother",
      type: "groom",
      relation: "신랑 어머니",
      name: import.meta.env.VITE_GROOM_MOTHER_NAME,
      phone: import.meta.env.VITE_GROOM_MOTHER_PHONE,
      bank: import.meta.env.VITE_GROOM_MOTHER_BANK,
      account: import.meta.env.VITE_GROOM_MOTHER_ACCOUNT,
    },

    // 🟩 신부 본인
    {
      id: "bride",
      type: "bride",
      relation: "신부",
      name: import.meta.env.VITE_BRIDE_NAME,
      phone: import.meta.env.VITE_BRIDE_PHONE,
      bank: import.meta.env.VITE_BRIDE_BANK,
      account: import.meta.env.VITE_BRIDE_ACCOUNT,
    },

    // 👨‍👧 신부 아버지
    {
      id: "bride-father",
      type: "bride",
      relation: "신부 아버지",
      name: import.meta.env.VITE_BRIDE_FATHER_NAME,
      phone: import.meta.env.VITE_BRIDE_FATHER_PHONE,
      bank: import.meta.env.VITE_BRIDE_FATHER_BANK,
      account: import.meta.env.VITE_BRIDE_FATHER_ACCOUNT,
    },

    // 👩‍👧 신부 어머니
    {
      id: "bride-mother",
      type: "bride",
      relation: "신부 어머니",
      name: import.meta.env.VITE_BRIDE_MOTHER_NAME,
      phone: import.meta.env.VITE_BRIDE_MOTHER_PHONE,
      bank: import.meta.env.VITE_BRIDE_MOTHER_BANK,
      account: import.meta.env.VITE_BRIDE_MOTHER_ACCOUNT,
    },
  ];

  return (
    <ContactInfoContext.Provider value={contactInfo}>
      {children}
    </ContactInfoContext.Provider>
  );
}

export function useContactInfo() {
  return useContext(ContactInfoContext);
}
