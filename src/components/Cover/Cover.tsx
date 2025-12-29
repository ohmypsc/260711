import { useMemo, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { ContactModal } from "@/components/Cover/ContactModal";
import { useContactInfo } from "@/ContactInfoProvider";
import "./Cover.scss";

/** Leaf line divider (same as before) */
function LeafLine({ variant }: { variant: "top" | "bottom" }) {
  const EndCaps =
    variant === "top" ? (
      <>
        <path
          d="M10 19 C8 16, 3 16, 2 19 C3 22, 8 22, 10 19 Z"
          transform="translate(6 19) rotate(-8) scale(0.9) translate(-6 -19)"
          opacity="0.42"
        />
        <path
          d="M318 19 C316 16, 311 16, 310 19 C311 22, 316 22, 318 19 Z"
          transform="translate(314 19) rotate(10) scale(0.9) translate(-314 -19)"
          opacity="0.42"
        />
      </>
    ) : (
      <>
        <path
          d="M10 19 C8 16, 3 16, 2 19 C3 22, 8 22, 10 19 Z"
          transform="translate(6 19) rotate(6) scale(0.9) translate(-6 -19)"
          opacity="0.42"
        />
        <path
          d="M318 19 C316 16, 311 16, 310 19 C311 22, 316 22, 318 19 Z"
          transform="translate(314 19) rotate(-8) scale(0.9) translate(-314 -19)"
          opacity="0.42"
        />
      </>
    );

  return (
    <div className={`parent-line ${variant}`}>
      <svg viewBox="0 0 320 34" aria-hidden="true" preserveAspectRatio="none">
        {variant === "top" ? (
          <g fill="currentColor">
            {EndCaps}

            <path d="M18 20 C16 17, 11 17, 10 20 C11 23, 16 23, 18 20 Z" transform="translate(14 20) rotate(-14) scale(1.0) translate(-14 -20)" opacity="0.54" />
            <path d="M36 16 C34 13, 29 13, 28 16 C29 19, 34 19, 36 16 Z" transform="translate(32 16) rotate(16) scale(0.8) translate(-32 -16)" opacity="0.38" />
            <path d="M54 21 C52 18, 47 18, 46 21 C47 24, 52 24, 54 21 Z" transform="translate(50 21) rotate(-6) scale(0.95) translate(-50 -21)" opacity="0.5" />
            <path d="M72 15 C70 12, 65 12, 64 15 C65 18, 70 18, 72 15 Z" transform="translate(68 15) rotate(22) scale(0.85) translate(-68 -15)" opacity="0.44" />
            <path d="M92 20 C90 17, 84 17, 83 20 C84 23, 90 23, 92 20 Z" transform="translate(87.5 20) rotate(-12) scale(1.02) translate(-87.5 -20)" opacity="0.56" />
            <path d="M110 14 C108 11, 103 11, 102 14 C103 17, 108 17, 110 14 Z" transform="translate(106 14) rotate(6) scale(0.75) translate(-106 -14)" opacity="0.34" />
            <path d="M128 18 C126 15, 121 15, 120 18 C121 21, 126 21, 128 18 Z" transform="translate(124 18) rotate(-20) scale(0.95) translate(-124 -18)" opacity="0.48" />

            <path d="M148 15 C146 12, 141 12, 140 15 C141 18, 146 18, 148 15 Z" transform="translate(144 15) rotate(12) scale(0.9) translate(-144 -15)" opacity="0.46" />
            <path d="M166 18 C164 15, 159 15, 158 18 C159 21, 164 21, 166 18 Z" transform="translate(162 18) rotate(-16) scale(0.9) translate(-162 -18)" opacity="0.46" />
            <path d="M184 14 C182 11, 177 11, 176 14 C177 17, 182 17, 184 14 Z" transform="translate(180 14) rotate(-10) scale(0.88) translate(-180 -14)" opacity="0.44" />

            <path d="M202 19 C200 16, 194 16, 193 19 C194 22, 200 22, 202 19 Z" transform="translate(197.5 19) rotate(10) scale(1.02) translate(-197.5 -19)" opacity="0.56" />
            <path d="M220 15 C218 12, 213 12, 212 15 C213 18, 218 18, 220 15 Z" transform="translate(216 15) rotate(-18) scale(0.8) translate(-216 -15)" opacity="0.36" />
            <path d="M238 20 C236 17, 231 17, 230 20 C231 23, 236 23, 238 20 Z" transform="translate(234 20) rotate(20) scale(0.96) translate(-234 -20)" opacity="0.5" />
            <path d="M256 16 C254 13, 249 13, 248 16 C249 19, 254 19, 256 16 Z" transform="translate(252 16) rotate(-6) scale(0.82) translate(-252 -16)" opacity="0.4" />
            <path d="M274 22 C272 19, 267 19, 266 22 C267 25, 272 25, 274 22 Z" transform="translate(270 22) rotate(14) scale(0.98) translate(-270 -22)" opacity="0.52" />
            <path d="M292 19 C290 16, 285 16, 284 19 C285 22, 290 22, 292 19 Z" transform="translate(288 19) rotate(-10) scale(1.0) translate(-288 -19)" opacity="0.54" />

            <path d="M56 8 C54 6, 51 6, 50 8 C51 10, 54 10, 56 8 Z" transform="translate(53 8) rotate(22) scale(0.55) translate(-53 -8)" opacity="0.16" />
            <path d="M262 7 C260 5, 257 5, 256 7 C257 9, 260 9, 262 7 Z" transform="translate(259 7) rotate(-16) scale(0.55) translate(-259 -7)" opacity="0.16" />
          </g>
        ) : (
          <g fill="currentColor">
            {EndCaps}

            <path d="M22 12 C20 15, 15 15, 14 12 C15 9, 20 9, 22 12 Z" transform="translate(18 12) rotate(18) scale(0.9) translate(-18 -12)" opacity="0.48" />
            <path d="M42 19 C40 22, 35 22, 34 19 C35 16, 40 16, 42 19 Z" transform="translate(38 19) rotate(-8) scale(1.05) translate(-38 -19)" opacity="0.58" />
            <path d="M62 14 C60 17, 55 17, 54 14 C55 11, 60 11, 62 14 Z" transform="translate(58 14) rotate(6) scale(0.78) translate(-58 -14)" opacity="0.34" />
            <path d="M82 20 C80 23, 75 23, 74 20 C75 17, 80 17, 82 20 Z" transform="translate(78 20) rotate(-20) scale(1.02) translate(-78 -20)" opacity="0.56" />
            <path d="M102 17 C100 20, 94 20, 93 17 C94 14, 100 14, 102 17 Z" transform="translate(97.5 17) rotate(12) scale(0.9) translate(-97.5 -17)" opacity="0.46" />

            <path d="M126 22 C124 25, 119 25, 118 22 C119 19, 124 19, 126 22 Z" transform="translate(122 22) rotate(-4) scale(1.05) translate(-122 -22)" opacity="0.62" />
            <path d="M146 16 C144 19, 139 19, 138 16 C139 13, 144 13, 146 16 Z" transform="translate(142 16) rotate(14) scale(0.85) translate(-142 -16)" opacity="0.4" />
            <path d="M166 22 C164 25, 159 25, 158 22 C159 19, 164 19, 166 22 Z" transform="translate(162 22) rotate(-22) scale(0.95) translate(-162 -22)" opacity="0.5" />
            <path d="M184 18 C182 21, 177 21, 176 18 C177 15, 182 15, 184 18 Z" transform="translate(180 18) rotate(26) scale(0.9) translate(-180 -18)" opacity="0.46" />

            <path d="M202 21 C200 24, 194 24, 193 21 C194 18, 200 18, 202 21 Z" transform="translate(197.5 21) rotate(-8) scale(0.98) translate(-197.5 -21)" opacity="0.52" />
            <path d="M222 15 C220 18, 215 18, 214 15 C215 12, 220 12, 222 15 Z" transform="translate(218 15) rotate(20) scale(0.85) translate(-218 -15)" opacity="0.4" />
            <path d="M242 20 C240 23, 235 23, 234 20 C235 17, 240 17, 242 20 Z" transform="translate(238 20) rotate(-12) scale(1.02) translate(-238 -20)" opacity="0.56" />
            <path d="M262 14 C260 17, 255 17, 254 14 C255 11, 260 11, 262 14 Z" transform="translate(258 14) rotate(-16) scale(0.8) translate(-258 -14)" opacity="0.34" />
            <path d="M282 18 C280 21, 275 21, 274 18 C275 15, 280 15, 282 18 Z" transform="translate(278 18) rotate(8) scale(0.92) translate(-278 -18)" opacity="0.46" />
            <path d="M300 17 C298 20, 293 20, 292 17 C293 14, 298 14, 300 17 Z" transform="translate(296 17) rotate(-6) scale(1.0) translate(-296 -17)" opacity="0.52" />

            <path d="M92 30 C90 32, 87 32, 86 30 C87 28, 90 28, 92 30 Z" transform="translate(89 30) rotate(-12) scale(0.55) translate(-89 -30)" opacity="0.16" />
            <path d="M254 29 C252 31, 249 31, 248 29 C249 27, 252 27, 254 29 Z" transform="translate(251 29) rotate(18) scale(0.55) translate(-251 -29)" opacity="0.16" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function Cover() {
  const [open, setOpen] = useState(false);
  const info = useContactInfo();

  const names = useMemo(() => {
    const getName = (id: string) => info.find((c) => c.id === id)?.name ?? "";
    return {
      groom: getName("groom"),
      bride: getName("bride"),
      groomFather: getName("groom-father"),
      groomMother: getName("groom-mother"),
      brideFather: getName("bride-father"),
      brideMother: getName("bride-mother"),
    };
  }, [info]);

  return (
    <section className="w-cover cover-with-invitation">
      {/* 1) 시 전문 전체 */}
      <div className="cover-poetry">
        <div className="poetry-block">
          <p>나는 오래된 거리처럼 너를 사랑하고</p>
          <p>별들은 벌들처럼 웅성거리고</p>
        </div>

        <div className="poetry-block">
          <p>여름에는 작은 은색 드럼을 치는 것처럼</p>
          <p>네 손바닥을 두드리는 비를 줄게</p>
          <p>과거에게 그랬듯 미래에게도 아첨하지 않을게</p>
        </div>

        <div className="poetry-block">
          <p>어린 시절 순결한 비누 거품 속에서 우리가 했던 맹세들을 찾아</p>
          <p>너의 팔에 모두 적어줄게</p>
        </div>

        <p className="poet">진은영, &lt;청혼&gt; 중</p>
      </div>

      {/* 2) 초대글 전문 */}
      <div className="cover-message">
        <p>오래된 거리를      </svg>
    </div>
  );
}

export function Cover() {
  const [open, setOpen] = useState(false);
  const info = useContactInfo();

  const names = useMemo(() => {
    const getName = (id: string) => info.find((c) => c.id === id)?.name ?? "";
    return {
      groom: getName("groom"),
      bride: getName("bride"),
      groomFather: getName("groom-father"),
      groomMother: getName("groom-mother"),
      brideFather: getName("bride-father"),
      brideMother: getName("bride-mother"),
    };
  }, [info]);

  return (
    <section className="w-cover cover-with-invitation">
      {/* 1) 시 전문 전체 */}
      <div className="cover-poetry">
        <div className="poetry-block">
          <p>나는 오래된 거리처럼 너를 사랑하고</p>
          <p>별들은 벌들처럼 웅성거리고</p>
        </div>

        <div className="poetry-block">
          <p>여름에는 작은 은색 드럼을 치는 것처럼</p>
          <p>네 손바닥을 두드리는 비를 줄게</p>
          <p>과거에게 그랬듯 미래에게도 아첨하지 않을게</p>
        </div>

        <div className="poetry-block">
          <p>어린 시절 순결한 비누 거품 속에서 우리가 했던 맹세들을 찾아</p>
          <p>너의 팔에 모두 적어줄게</p>
        </div>

        <p className="poet">진은영, &lt;청혼&gt; 중</p>
      </div>

      {/* 2) 초대글 전문 */}
      <div className="cover-message">
        <p>오래된 거리를 거닐듯 편안하고,</p>
        <p>밤하늘 별들처럼 벅찬 설렘을 주는 사람을 만났습니다.</p>
        <br />
        <p>함께라면 여름의 궂은 비도 낭만이 되는 사람과</p>
        <p>매 순간 거짓 없는 진심을 다하며 살겠습니다.</p>
        <p>순수한 첫 마음 그대로 서로를 아끼겠습니다.</p>
        <br />
        <p>저희 두 사람의 앞날을</p>
        <p>따뜻한 마음으로 축복해 주시면 감사하겠습니다.</p>
      </div>

      {/* 3) 가족관계 */}
      <div className="family-section">
        <LeafLine variant="top" />

        <div className="name">
          <span className="parent-names">
            {names.groomFather} · {names.groomMother}의
          </span>{" "}
          <span className="relation-name relation-name--adjust">아들</span>{" "}
          {names.groom}
        </div>

        <div className="name">
          <span className="parent-names">
            {names.brideFather} · {names.brideMother}의
          </span>{" "}
          <span className="relation-name relation-name--adjust">딸</span>{" "}
          {names.bride}
        </div>

        <LeafLine variant="bottom" />
      </div>

      {/* 4) CTA */}
      <Button variant="basic" onClick={() => setOpen(true)}>
        축하 인사 전하기
      </Button>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </section>
  );
}
