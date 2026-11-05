import React, { useState, type FormEvent } from "react";
import { assets } from "../types/admin";

export function AdminLogin({
  onLoginSuccess,
  onGoSignup,
}: {
  onLoginSuccess: (name: string) => void;
  onGoSignup: () => void;
}) {
  const [email, setEmail] = useState("admin@misterworld.com");
  const [password, setPassword] = useState("admin1234!");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onLoginSuccess("최고관리자");
  };

  return (
    <div className="min-h-dvh bg-[#f7f7f7]">
      <header className="flex h-[68px] items-center border-b border-black bg-white px-5 sm:px-10 lg:px-[100px]">
        <span className="font-['EB_Garamond:Bold'] text-2xl font-bold text-[#1596b4]">
          Mr. World Theme Tour
        </span>
      </header>
      <main className="mx-auto min-h-[calc(100dvh-68px)] w-full max-w-[1280px] bg-white px-5 py-10 sm:px-10 lg:px-[100px] lg:py-16">
        <section className="flex min-h-[450px] items-center justify-center bg-[#f7f7f7]/85 px-5 py-[37px]">
          <form className="w-full max-w-[500px]" onSubmit={submit}>
            <label className="mb-[30px] block font-['EB_Garamond:Regular'] text-xl">
              아이디 (이메일)
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="아이디를 입력해주세요."
                className="mt-2.5 h-[50px] w-full border border-black bg-white px-5 text-base outline-none focus:border-[#1596b4]"
              />
            </label>
            <label className="mb-[30px] block font-['EB_Garamond:Regular'] text-xl">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요."
                className="mt-2.5 h-[50px] w-full border border-black bg-white px-5 text-base outline-none focus:border-[#1596b4]"
              />
            </label>
            <button
              type="submit"
              className="h-[50px] w-full rounded-[10px] bg-[#1596b4] text-lg font-bold text-white hover:bg-[#117f99] transition cursor-pointer"
            >
              로그인
            </button>
            <button
              type="button"
              onClick={onGoSignup}
              className="mt-5 w-full text-center text-sm text-[#555] underline underline-offset-4 cursor-pointer"
            >
              관리자 회원가입
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export function AdminSignup({
  onGoLogin,
  onComplete,
}: {
  onGoLogin: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [code, setCode] = useState("");

  return (
    <div className="min-h-dvh bg-[#f7f7f7]">
      <header className="flex h-[68px] items-center justify-between border-b border-[#dde4e8] bg-white px-8">
        <span className="font-['EB_Garamond:Bold'] text-2xl font-bold text-[#1596b4]">Mr. World Tour</span>
        <button type="button" onClick={onGoLogin} className="text-sm text-[#666]">로그인으로 돌아가기</button>
      </header>
      <main className="mx-auto max-w-xl py-12 px-4">
        <div className="rounded-xl border border-[#dde4e8] bg-white p-8">
          <h2 className="text-xl font-bold mb-6 text-center text-[#17212b]">
            관리자 회원가입 ({step} / 4단계)
          </h2>

          {step === 1 && (
            <div>
              <div className="p-4 bg-[#f8fafb] text-xs text-[#555] rounded mb-6 leading-relaxed">
                [필수] 미스터월드 테마투어 관리자 운영 정책 및 개인정보 처리방침에 동의합니다.
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-12 w-full rounded-md bg-[#1596b4] font-bold text-white hover:bg-[#117f99]"
              >
                약관 동의 및 다음 단계
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input placeholder="이름 (예: 홍길동)" className="h-11 w-full border rounded px-3 text-sm" />
              <div className="flex gap-2">
                <input placeholder="휴대폰 번호 (- 제외)" className="h-11 flex-1 border rounded px-3 text-sm" />
                <button
                  type="button"
                  onClick={() => alert("[테스트 모드] 인증번호 123456")}
                  className="rounded bg-[#1596b4] px-4 text-xs font-bold text-white"
                >
                  인증요청
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="인증번호 6자리"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 flex-1 border rounded px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (code === "123456" || code.length === 6) {
                      setPhoneVerified(true);
                      alert("본인인증이 완료되었습니다.");
                    } else alert("인증번호 123456을 입력하세요.");
                  }}
                  className="rounded border border-[#1596b4] px-4 text-xs font-bold text-[#1596b4]"
                >
                  {phoneVerified ? "인증완료" : "확인"}
                </button>
              </div>

              {/* 1:1 너비 및 세로 꺾임 방지 버튼 */}
              <div className="flex items-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 flex-1 whitespace-nowrap rounded-md border border-[#c8d2d8] bg-white text-sm text-[#444] hover:bg-[#f8fafb]"
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={!phoneVerified}
                  onClick={() => setStep(3)}
                  className="h-12 flex-1 whitespace-nowrap rounded-md bg-[#1596b4] font-bold text-white hover:bg-[#117f99] disabled:bg-gray-300"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <input placeholder="이메일 (아이디)" className="h-11 w-full border rounded px-3 text-sm" />
              <input type="password" placeholder="비밀번호 (영문, 숫자 포함 10자 이상)" className="h-11 w-full border rounded px-3 text-sm" />
              <input placeholder="직원 인증코드 (기본: MW-STAFF-2026)" defaultValue="MW-STAFF-2026" className="h-11 w-full border rounded px-3 text-sm" />
              <div className="flex items-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-12 flex-1 whitespace-nowrap rounded-md border border-[#c8d2d8] bg-white text-sm text-[#444] hover:bg-[#f8fafb]"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="h-12 flex-1 whitespace-nowrap rounded-md bg-[#1596b4] font-bold text-white hover:bg-[#117f99]"
                >
                  가입 완료
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <p className="text-lg font-bold text-[#1596b4] mb-2">가입이 완료되었습니다!</p>
              <p className="text-xs text-[#666] mb-6">등록하신 계정으로 바로 로그인하실 수 있습니다.</p>
              <button
                type="button"
                onClick={onComplete}
                className="h-11 w-full rounded bg-[#1596b4] text-white font-bold text-sm"
              >
                로그인 화면으로 이동
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
