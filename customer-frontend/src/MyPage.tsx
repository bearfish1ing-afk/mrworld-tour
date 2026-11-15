import type { UserLevel, UserResponse } from "./api/types"
import { formatDate, levelInfo } from "./api/view"

const formatPhone = (phone: string) =>
  phone.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3")

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

export default function MyPage({ user }: { user: UserResponse }) {
  const userName = user.nickname || user.name
  const level = levelInfo[user.level] ?? levelInfo.BRONZE
  const levels = Object.entries(levelInfo) as [UserLevel, (typeof levelInfo)[UserLevel]][]
  const nextLevel = levels.find(([, info]) => info.minAmount > level.minAmount)?.[1]
  const levelIndex = levels.findIndex(([key]) => key === user.level)
  const progress = ((levelIndex + 1) / levels.length) * 100

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
                {level.label}
              </span>
              <div>
                <p className="font-dot-medium text-xl leading-[1.45]">
                  {user.name}님{" "}
                  <span className="font-dot-regular text-xs text-[#707070]">
                    ({user.email})
                  </span>
                </p>
                <p className="font-dot-regular text-xs leading-[1.45] text-[#707070]">
                  가입일 {formatDate(user.createdAt)} · 연락처: {formatPhone(user.phoneNum)}
                </p>
                <p className="font-dot-regular text-xs leading-[1.45] text-[#707070]">
                  주소: {user.address}
                </p>
              </div>
            </div>
            <p className="font-dot-regular text-xs text-[#707070] self-start sm:self-center">
              회원 정보 수정은 고객센터(1588-2200)로 문의해 주세요.
            </p>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 md:px-10 lg:px-[100px] mt-6">
        <section className="scroll-mt-6" id="membership">
          <div className="mt-5 grid border border-[#d9d9d9] lg:grid-cols-[420px_1fr]">
            <div className="bg-[#f0f9fb] p-[30px]">
              <p className="font-dot-regular text-[13px] leading-[1.45] text-[#1596b4]">
                {userName}님의 현재 등급
              </p>
              <p className="mt-4 font-dot-semibold text-[28px] leading-[1.45] text-[#1596b4]">
                {level.label} 회원
              </p>
              <div className="mt-4 h-1.5 bg-[#d9d9d9]">
                <div className="h-full bg-[#1596b4]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-4 font-dot-regular text-[13px] leading-[1.45]">
                {nextLevel
                  ? `최근 1년 이용 금액이 ${(nextLevel.minAmount / 10_000).toLocaleString("ko-KR")}만원 이상이면 ${nextLevel.label} 등급이 됩니다.`
                  : "최고 등급입니다. 감사합니다!"}
              </p>
            </div>
            <div className="p-[30px]">
              <h3 className="font-dot-medium text-xl leading-[1.45]">
                {level.label} 회원 혜택
              </h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-7">
                <div>
                  <p className="font-dot-semibold text-[22px] leading-[1.45] text-[#1596b4]">
                    {level.discountRate > 0 ? `${level.discountRate}% 할인` : "할인 없음"}
                  </p>
                  <p className="mt-2 font-dot-regular text-[13px] text-[#707070]">
                    예약 결제 금액에서 자동 차감
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-between border-t border-[#d9d9d9] pt-4 font-dot-regular text-xs">
                {levels.map(([key, info]) => (
                  <p className={key === user.level ? "text-[#1596b4]" : "text-[#707070]"} key={key}>
                    {info.label} ·{" "}
                    {info.minAmount === 0
                      ? "가입 즉시"
                      : `연 ${(info.minAmount / 10_000).toLocaleString("ko-KR")}만원`}{" "}
                    ({info.discountRate}%)
                  </p>
                ))}
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