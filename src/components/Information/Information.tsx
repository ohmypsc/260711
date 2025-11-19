import "./Information.scss";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { AccountModal } from "./AccountModal";

interface ContactInfo {
  id: number;
  type: string;
  relation: string;
  name: string;
  phone: string | null;
  bank: string | null;
  account: string | null;
  order_index: number;
}

export function Information() {
  const [openModal, setOpenModal] = useState(false);
  const [brideInfo, setBrideInfo] = useState<ContactInfo[]>([]);
  const [groomInfo, setGroomInfo] = useState<ContactInfo[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("❌ 혼주 정보 불러오기 실패:", error);
        return;
      }

      if (!data) return;

      const bride = data.filter((item) => item.type.startsWith("bride"));
      const groom = data.filter((item) => item.type.startsWith("groom"));

      if (mounted) {
        setBrideInfo(bride);
        setGroomInfo(groom);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="information">
      <h2>혼주 정보</h2>

      <button onClick={() => setOpenModal(true)} className="account-btn">
        계좌번호 보기
      </button>

      {openModal && (
        <AccountModal
          onClose={() => setOpenModal(false)}
          brideInfo={brideInfo}
          groomInfo={groomInfo}
        />
      )}
    </div>
  );
}
