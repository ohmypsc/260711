function WriteAttendanceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (row: AttendanceRow) => void;
}) {
  const [loading, setLoading] = useState(false);

  const [side, setSide] = useState<Side | "">("");
  const [meal, setMeal] = useState<Meal | "">("");
  const [count, setCount] = useState(1);

  const ref = useRef({
    name: null as unknown as HTMLInputElement,
    phone: null as unknown as HTMLInputElement,
  });

  const clampCount = (v: number) => {
    if (Number.isNaN(v)) return 1;
    return Math.max(1, Math.min(10, v));
  };

  return (
    <Modal onClose={onClose}>
      {/* ✅ Write 모달은 서브타이틀 없음 */}
      <AttendanceModalLayout title="참석 여부 확인하기">
        <form
          className="attendance-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              const name = ref.current.name.value.trim();
              const rawPhone = ref.current.phone.value.trim();
              const phone = normalizePhone(rawPhone);

              if (!name || !rawPhone || !side) {
                alert("이름, 연락처, 하객 구분은 필수입니다.");
                setLoading(false);
                return;
              }
              if (!meal) {
                alert("식사 여부를 선택해주세요.");
                setLoading(false);
                return;
              }

              const { data, error } = await supabase
                .from("attendance")
                .insert([{ name, phone, count, side, meal }])
                .select("*")
                .single();

              if (error) throw error;

              alert("참석 여부가 등록되었습니다. 감사합니다!");
              onSuccess(data as AttendanceRow);
              onClose();
            } catch (err) {
              console.error(err);
              alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {/* ✅ placeholder 완전 제거 */}
          <div className="field span-2">
            <label className="label">이름 *</label>
            <input
              disabled={loading}
              type="text"
              autoComplete="off"
              ref={(r) => (ref.current.name = r as HTMLInputElement)}
            />
          </div>

          {/* ✅ placeholder 완전 제거 */}
          <div className="field span-2">
            <label className="label">연락처 *</label>
            <input
              disabled={loading}
              type="tel"
              autoComplete="off"
              ref={(r) => (ref.current.phone = r as HTMLInputElement)}
            />
          </div>

          {/* ✅ 하객 구분: 한 줄(별도 행) */}
          <div className="field span-2">
            <label className="label">하객 구분 *</label>
            <ToggleRow
              value={side}
              onChange={setSide}
              options={[
                { label: "신랑 측", value: "groom" },
                { label: "신부 측", value: "bride" },
              ]}
            />
          </div>

          {/* ✅ 참석 인원: 한 줄(별도 행) + 숫자 입력 */}
          <div className="field span-2">
            <label className="label">참석 인원 *</label>
            <input
              disabled={loading}
              type="number"
              min={1}
              max={10}
              step={1}
              value={count}
              onChange={(e) => {
                const v = clampCount(parseInt(e.target.value, 10));
                setCount(v);
              }}
            />
          </div>

          {/* ✅ 식사 여부: O / X / 미정 */}
          <div className="field span-2">
            <label className="label">식사 여부 *</label>
            <ToggleRow
              value={meal}
              onChange={setMeal}
              options={[
                { label: "O", value: "yes" },
                { label: "X", value: "no" },
                { label: "미정", value: "unknown" },
              ]}
            />
          </div>

          <div className="attendance-form__actions">
            <Button variant="submit" type="submit" disabled={loading}>
              저장하기
            </Button>
          </div>
        </form>
      </AttendanceModalLayout>
    </Modal>
  );
}
