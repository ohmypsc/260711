import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const ContactInfoContext = createContext([]);

export function ContactInfoProvider({ children }) {
  const [contactInfo, setContactInfo] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("❌ 연락처 정보 로딩 실패:", error);
      } else {
        setContactInfo(data || []);
      }
    }

    fetchData();
  }, []);

  return (
    <ContactInfoContext.Provider value={contactInfo}>
      {children}
    </ContactInfoContext.Provider>
  );
}

export function useContactInfo() {
  return useContext(ContactInfoContext);
}
