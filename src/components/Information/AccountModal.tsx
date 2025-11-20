// -----------------------------------------
// ContactInfoProvider.tsx (최종 완성본)
// -----------------------------------------

import { createContext, useContext } from "react";

const ContactInfoContext = createContext([]);

/* -------------------------------------------------
   ContactInfoProvider — 정적 개인 연락처 & 계좌 정보 제공
   GitHub Secrets → .env.production → import.meta.env
--------------------------------------------------- */

export function ContactInfoProvider({ children }) {
  const contactInfo = [
    /* 🟦 신랑 측 ------------------------------------ */
    {
      id: "groom",
      type: "groom",
      relation: "신랑",
      name: import.meta.env.VITE_GROOM_NAME,
      phone: import.meta.env.VITE_GROOM_PHONE,
      bank: import.meta.env.VITE_GROOM_BANK,
      account: import.meta.env.VITE_GROOM_ACCOUNT,
    },
    {
      id: "groom-father",
      type: "groom",
      relation: "신랑 아버지",
      name: import.meta.env.VITE_GROOM_FATHER_NAME,
      phone: import.meta.env.VITE_GROOM_FATHER_PHONE,
      bank: import.meta.env.VITE_GROOM_FATHER_BANK,
      account: import.meta.env.VITE_GROOM_FATHER_ACCOUNT,
    },
    {
      id: "groom-mother",
      type: "groom",
      relation: "신랑 어머니",
      name: import.meta.env.VITE_GROOM_MOTHER_NAME,
      phone: import.meta.env.VITE_GROOM_MOTHER_PHONE,
      bank: import.meta.env.VITE_GROOM_MOTHER_BANK,
      account: import.meta.env.VITE_GROOM_MOTHER_ACCOUNT,
    },

    /* 🟩 신부 측 ------------------------------------ */
    {
      id: "bride",
      type: "bride",
      relation: "신부",
      name: import.meta.env.VITE_BRIDE_NAME,
      phone: import.meta.env.VITE_BRIDE_PHONE,
      bank: import.meta.env.VITE_BRIDE_BANK,
      account: import.meta.env.VITE_BRIDE_ACCOUNT,
    },
    {
      id: "bride-father",
      type: "bride",
      relation: "신부 아버지",
      name: import.meta.env.VITE_BRIDE_FATHER_NAME,
      phone: import.meta.env.VITE_BRIDE_FATHER_PHONE,
      bank: import.meta.env.VITE_BRIDE_FATHER_BANK,
      account: import.meta.env.VITE_BRIDE_FATHER_ACCOUNT,
    },
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
