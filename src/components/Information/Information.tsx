import "./Information.scss";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { AccountModal } from "./AccountModal";

export function Information() {
  const [openModal, setOpenModal] = useState(false);
  const [brideInfo, setBrideInfo] = useState([]);
  const [groomInfo, setGroomInfo] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ 혼주 정보 불러오기 실패:", error);
        return;
      }

      const bride = data.filter((item) => item.relation.includes("신부"));
      const groom = data.filter((item) => item.relation.includes("신랑"));

      setBrideInfo(bride);
      setGroomInfo(groom);
    }

    fetchData();
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
