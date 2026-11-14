import { useState } from "react"

const customerChannels = [
  ["해외여행 문의", "1588-2200", "연중무휴 09:00 ~ 20:00"],
  ["국내여행 문의", "1588-3300", "연중무휴 09:00 ~ 20:00"],
  ["해외항공권 문의", "1588-4400", "평일 09:00 ~ 18:00"],
  ["단체여행 문의", "1588-5500", "평일 09:00 ~ 18:00"],
]

function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[#151515] pb-4">
      <h2 className="font-dot-medium text-[22px] leading-[1.45] text-[#151515]">
        {title}
      </h2>
      <p className="text-right font-dot-regular text-[13px] leading-[1.45] text-[#707070]">
        {description}
      </p>
    </div>
  )
}

export default function MyPage({ currentUser }: { currentUser?: string }) {
  const userName = currentUser
    ? currentUser.includes("@")
      ? currentUser.split("@")[0]
      : currentUser
    : "김민지"
  const userEmail =
    currentUser && currentUser.includes("@")
      ? currentUser
      : `${userName}@misterworld.com`

  const [isEditing, setIsEditing] = useState(false)
  const [phone, setPhone] = useState("010-1234-5678")
  const [address, setAddress] = useState("서울특별시 동대문구 서울시립대로 163")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [feedback, setFeedback] = useState<{
    type: "error" | "success"
    message: string
  } | null>(null)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/
    if (!phoneRegex.test(phone)) {
      setFeedback({
        type: "error",
        message: "올바른 휴대전화 번호 형식(예: 010-1234-5678)을 입력해 주세요.",
      })
      return
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        setFeedback({
          type: "error",
          message: "현재 비밀번호를 입력해 주세요.",
        })
        return
      }
      if (newPassword.length < 8) {
        setFeedback({
          type: "error",
          message: "새 비밀번호는 최소 8자 이상이어야 합니다.",
        })
        return
      }
      if (newPassword !== confirmPassword) {
        setFeedback({
          type: "error",
          message: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        })
        return
      }
    }

    setFeedback({
      type: "success",
      message: "회원 정보가 성공적으로 수정되었습니다.",
    })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    setTimeout(() => {
      setIsEditing(false)
      setFeedback(null)
    }, 1500)
  }

  return (
    <main className="bg-white text-[#151515]">
      <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-[26px] md:px-10 lg:px-[100px]">
        <p className="font-roboto-regular text-xs text-[#707070]">
          홈&nbsp;&nbsp;›&nbsp;&nbsp;마이페이지
        </p>
        <section className="mt-6 border-y border-[#171717] bg-[#c7e8ef] px-[30px] py-5">
          <h1 className="font-dot-medium text-[28px] leading-[1.45]">
            마이페이지
          </h1>
          <p className="mt-2.5 font-dot-regular text-[15px] leading-[1.45]">
            <strong className="font-dot-bold">{userName}</strong>님, 안녕하세요. 나의 회원 등급과 혜택을 확인하세요.
          </p>
        </section>

        <section className="mt-6 border border-[#d9d9d9]">
          <div className="flex flex-col gap-4 bg-[#f7f7f7] px-[30px] py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="bg-[#1596b4] px-3.5 py-1.5 font-dot-semibold text-sm text-white">
                실버
              </span>
              <div>
                <p className="font-dot-medium text-xl leading-[1.45]">
                  {userName}님{" "}
                  <span className="font-dot-regular text-xs text-[#707070]">
                    ({userEmail})
                  </span>
                </p>
                <p className="font-dot-regular text-xs leading-[1.45] text-[#707070]">
                  가입일 2025.03.12 · 연락처: {phone}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing((prev) => !prev)
                setFeedback(null)
              }}
              className="h-9 rounded border border-[#1596b4] bg-white px-4 font-dot-regular text-xs text-[#1596b4] transition-colors hover:bg-[#f0f9fb] cursor-pointer self-start sm:self-center"
            >
              {isEditing ? "수정 취소" : "회원 정보 수정"}
            </button>
          </div>
        </section>

        {isEditing && (
          <section className="mt-6 border border-[#1596b4] bg-[#f0f9fb] p-6 rounded-md">
            <h2 className="border-b border-[#1596b4] pb-3 font-dot-semibold text-lg text-[#1596b4]">
              회원 정보 수정
            </h2>
            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 max-w-[600px]">
              <div>
                <label className="block font-dot-medium text-sm text-[#111] mb-1">
                  이메일 (아이디)
                </label>
                <input
                  type="text"
                  value={userEmail}
                  disabled
                  className="h-10 w-full rounded border border-[#d9d9d9] bg-[#e5e7eb] px-3 font-dot-regular text-sm text-[#6b7280] outline-none"
                />
              </div>

              <div>
                <label className="block font-dot-medium text-sm text-[#111] mb-1">
                  휴대전화 번호 <span className="text-[#1596b4]">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="h-10 w-full rounded border border-[#d9d9d9] bg-white px-3 font-dot-regular text-sm text-[#111] outline-none focus:border-[#1596b4]"
                />
              </div>

              <div>
                <label className="block font-dot-medium text-sm text-[#111] mb-1">
                  주소
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="주소를 입력하세요"
                  className="h-10 w-full rounded border border-[#d9d9d9] bg-white px-3 font-dot-regular text-sm text-[#111] outline-none focus:border-[#1596b4]"
                />
              </div>

              <div className="border-t border-[#d9d9d9] pt-4 mt-4">
                <p className="font-dot-semibold text-sm text-[#111] mb-3">
                  비밀번호 변경 (선택)
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block font-dot-regular text-xs text-[#707070] mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="현재 비밀번호 입력"
                      className="h-10 w-full rounded border border-[#d9d9d9] bg-white px-3 font-dot-regular text-sm outline-none focus:border-[#1596b4]"
                    />
                  </div>
                  <div>
                    <label className="block font-dot-regular text-xs text-[#707070] mb-1">
                      새 비밀번호 (8자 이상)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호 입력"
                      className="h-10 w-full rounded border border-[#d9d9d9] bg-white px-3 font-dot-regular text-sm outline-none focus:border-[#1596b4]"
                    />
                  </div>
                  <div>
                    <label className="block font-dot-regular text-xs text-[#707070] mb-1">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 재입력"
                      className="h-10 w-full rounded border border-[#d9d9d9] bg-white px-3 font-dot-regular text-sm outline-none focus:border-[#1596b4]"
                    />
                  </div>
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded text-xs font-dot-medium ${
                    feedback.type === "error"
                      ? "bg-[#fff7f7] text-[#a43d3d] border border-[#e4b8b8]"
                      : "bg-[#eaf7f9] text-[#1596b4] border border-[#1596b4]"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="h-10 bg-[#1596b4] px-6 font-dot-semibold text-sm text-white rounded hover:bg-[#117a93] transition-colors cursor-pointer"
                >
                  변경사항 저장
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="h-10 border border-[#d9d9d9] bg-white px-5 font-dot-regular text-sm text-[#707070] rounded hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  취소
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      <div className="mx-auto max-w-[1280px] px-5 md:px-10 lg:px-[100px] mt-6">
        <section className="scroll-mt-6" id="membership">
          <div className="mt-5 grid border border-[#d9d9d9] lg:grid-cols-[420px_1fr]">
            <div className="bg-[#f0f9fb] p-[30px]">
              <p className="font-dot-regular text-[13px] leading-[1.45] text-[#1596b4]">
                {userName}님의 현재 등급
              </p>
              <p className="mt-4 font-dot-semibold text-[28px] leading-[1.45] text-[#1596b4]">
                실버 회원
              </p>
              <p className="mt-4 font-dot-regular text-sm leading-[1.45]">
                최근 1년 여행 완료 2회
              </p>
              <div className="mt-4 h-1.5 bg-[#d9d9d9]">
                <div className="h-full w-[40%] bg-[#1596b4]" />
              </div>
              <p className="mt-4 font-dot-regular text-[13px] leading-[1.45]">
                여행 3회 더 완료하면 골드 등급이 됩니다.
              </p>
            </div>
            <div className="p-[30px]">
              <h3 className="font-dot-medium text-xl leading-[1.45]">
                실버 회원 혜택
              </h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-7">
                <div>
                  <p className="font-dot-semibold text-[22px] leading-[1.45] text-[#1596b4]">
                    1% 적립
                  </p>
                  <p className="mt-2 font-dot-regular text-[13px] text-[#707070]">
                    여행 완료 후 결제금액 기준
                  </p>
                </div>
                <div>
                  <p className="font-dot-semibold text-[22px] leading-[1.45] text-[#1596b4]">
                    생일 쿠폰
                  </p>
                  <p className="mt-2 font-dot-regular text-[13px] text-[#707070]">
                    매년 생일월 20,000원 할인
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-between border-t border-[#d9d9d9] pt-4 font-dot-regular text-xs">
                <p className="text-[#707070]">일반 · 가입 즉시</p>
                <p className="text-[#1596b4]">실버 · 여행 2회</p>
                <p className="text-[#707070]">골드 · 여행 5회</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-[72px] pt-[120px]">
          <div className="bg-[#f7f7f7] px-4 py-[38px] md:px-[30px]">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <h2 className="font-dot-semibold text-[28px] text-[#111]">
                고객센터
              </h2>
              <p className="font-dot-regular text-xs text-[#686868]">
                여행 준비부터 귀국까지, 미스터 월드가 함께합니다.
              </p>
            </div>
            <div className="mt-[30px] grid grid-cols-1 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {customerChannels.map(([title, number, hours], index) => (
                <div
                  className={`flex flex-col gap-[7px] px-[18px] ${
                    index > 0 ? "border-[#d9d9d9] lg:border-l" : ""
                  }`}
                  key={title}
                >
                  <p className="font-dot-bold text-sm text-[#111]">{title}</p>
                  <p className="font-eb-semibold text-[21px] text-[#111]">
                    {number}
                  </p>
                  <p className="font-dot-regular text-[11px] text-[#686868]">
                    {hours}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-[30px] flex flex-col gap-2 border-t border-[#d9d9d9] pt-[22px] text-xs md:flex-row md:justify-between">
              <p className="font-dot-regular text-[#686868]">
                ARS 1번 예약상담 및 조회 · 2번 마일리지, 제휴, 상품권 및 기타
                문의
              </p>
              <p className="font-dot-semibold text-[#111]">
                법인고객 전용 1588-6600
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}