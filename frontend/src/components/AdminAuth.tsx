import React, { useState, type FormEvent, type ReactNode } from "react";
import { assets } from "../types/admin";
import { adminLogin, adminSignup, requestSmsCode, verifySmsCode } from "../api/admin";
import { errorMessage, setSession } from "../api/client";

function AdminBrand() {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="relative h-10 w-[39px] shrink-0 overflow-hidden">
        <img
          src={assets.logo}
          alt=""
          className="pointer-events-none absolute left-[-52.17%] top-[-47.88%] h-[198.61%] w-[204.33%] max-w-none"
        />
      </div>
      <span className="font-['EB_Garamond:Bold'] text-xl font-bold tracking-[-0.44px] text-[#1596b4] sm:text-[22px] whitespace-nowrap">
        미스터 월드 관리자
      </span>
    </div>
  );
}

function AdminAuthHeader({
  actionLabel,
  onAction,
}: {
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <header className="flex h-[72px] w-full items-center justify-between border-b border-[#dde4e8] bg-white px-4 sm:px-7">
      <AdminBrand />
      {actionLabel && onAction && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAction}
            className="rounded-md border border-[#c8d2d8] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#17212b] hover:bg-[#f8fafb] transition cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </header>
  );
}

export function AdminLogin({
  notice,
  onLoginSuccess,
  onGoSignup,
}: {
  notice?: string;
  onLoginSuccess: (name: string) => void;
  onGoSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 관리자 로그인 API 호출 → 토큰 저장
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await adminLogin(email.trim(), password);
      setSession(res.accessToken, email.trim());
      onLoginSuccess(email.trim());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#f7f7f7]">
      <AdminAuthHeader />
      <main className="mx-auto min-h-[calc(100dvh-72px)] w-full max-w-[1280px] bg-white px-5 py-10 sm:px-10 lg:px-[100px] lg:py-16">
        <section className="flex min-h-[450px] items-center justify-center bg-[#f7f7f7]/85 px-5 py-[37px]">
          <form className="w-full max-w-[500px]" onSubmit={submit}>
            <label className="mb-[30px] block font-['EB_Garamond:Regular'] text-xl">
              아이디 (이메일)
              <input
                type="email"
                autoComplete="username"
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
            {(error || notice) && (
              <p role="alert" className="mb-4 text-center text-sm font-medium text-[#c33]">
                {error || notice}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="h-[50px] w-full rounded-[10px] bg-[#1596b4] text-lg font-bold text-white hover:bg-[#117f99] transition cursor-pointer disabled:opacity-60"
            >
              {loading ? "로그인 중..." : "로그인"}
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

type SignupStep = 1 | 2 | 3 | 4;

type SignupForm = {
  name: string;
  birthDate: string;
  carrier: string;
  phone: string;
  verificationCode: string;
  address: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  employeeCode: string;
};

// 직원용 인증번호: 지금은 화면에서만 확인해요 (백엔드 관리자 가입 API는 아직 검사하지 않음)
const issuedEmployeeCode = "MW-STAFF-2026";

const signupInput =
  "h-12 w-full rounded-[4px] border border-[#9a9a9a] bg-white px-3.5 font-['42dot_Sans:Regular'] text-[15px] outline-none placeholder:text-[#8a8a8a] focus:border-[#1596b4]";

function SignupHeader({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <>
      <header className="flex h-[100px] items-center justify-between border-b border-[#151515] bg-white px-5 sm:px-10 lg:px-[100px]">
        <div className="flex items-center gap-2">
          <div className="relative size-[55px] shrink-0 overflow-hidden">
            <img
              src={assets.logo}
              alt=""
              className="pointer-events-none absolute left-[-52.17%] top-[-47.88%] h-[198.61%] w-[204.33%] max-w-none"
            />
          </div>
          <span className="font-['EB_Garamond:Bold'] text-[26px] font-bold tracking-[-0.64px] text-[#1596b4] sm:text-[32px]">
            미스터 월드
          </span>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-3 font-['Roboto:Regular'] text-xs text-[#252525]">
            <button type="button" onClick={onLogin} className="hover:text-[#1596b4] cursor-pointer">
              로그인
            </button>
            <span className="h-2.5 w-px bg-[#d7d7d7]" />
            <button type="button" onClick={onSignup} className="font-bold text-[#1596b4] cursor-pointer">
              회원가입
            </button>
          </div>
          <div className="hidden items-center gap-[30px] sm:flex">
            <div className="flex flex-col items-center gap-[3px] text-sm text-[#252525]">
              <img src={assets.signupPerson} alt="" className="size-[25px]" />
              <span>마이페이지</span>
            </div>
            <div className="flex flex-col items-center gap-[3px] text-sm text-[#252525]">
              <img src={assets.signupReservation} alt="" className="size-[25px]" />
              <span>예약 내역</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="hidden h-[45px] items-center justify-between border-b border-[#151515] bg-white px-[100px] lg:flex">
        <div className="flex h-full">
          {["전체 메뉴", "테마 여행", "여행사 소개", "이용 안내"].map((item, index) => (
            <div
              key={item}
              className={`flex w-[155px] items-center justify-center gap-2 border-x-[0.8px] border-[#151515] text-[15px] ${
                index === 1 ? "bg-[#1596b4] font-bold text-white" : "bg-white text-[#151515]"
              }`}
            >
              {index === 0 && <img src={assets.signupMenu} alt="" className="size-[17px]" />}
              {item}
            </div>
          ))}
        </div>
        <div className="flex h-[34px] w-[320px] items-center gap-2.5 rounded-full border border-[#151515] px-3.5 xl:w-[400px]">
          <span className="flex-1 text-[13px] text-[#8a8a8a]">여행지를 검색해 보세요</span>
          <img src={assets.search} alt="" className="size-5" />
        </div>
      </nav>
    </>
  );
}

//회원가입 위쪽 단계 안내
function SignupSteps({ current }: { current: SignupStep }) {
  const steps = ["약관 동의", "본인 인증", "정보 등록", "가입 완료"];

  return (
    <div className="flex w-full items-start justify-between sm:px-10">
      {steps.map((label, index) => {
        const number = (index + 1) as SignupStep;
        const active = number === current;
        const complete = number < current;

        return (
          <div key={label} className="contents">
            <div className="flex w-[70px] flex-col items-center gap-2 sm:w-[100px]">
              <div
                className={`flex size-9 items-center justify-center rounded-full font-['EB_Garamond:Regular'] text-lg sm:size-[45px] sm:text-xl ${
                  active
                    ? "bg-[#1596b4] text-white"
                    : complete
                    ? "border border-[#1596b4] bg-[#e7f5f7] text-[#111827]"
                    : "bg-[#d9d9d9] text-[#111827]"
                }`}
              >
                {number}
              </div>
              <span
                className={`text-center font-['EB_Garamond:Regular'] text-sm sm:text-lg ${
                  active ? "font-['EB_Garamond:Bold'] font-bold text-[#1596b4]" : "text-[#718096]"
                }`}
              >
                {label}
              </span>
            </div>
            {number < 4 && (
              <img
                src={assets.signupArrow}
                alt=""
                className="mt-2 size-5 shrink-0 sm:mt-2.5 sm:size-6"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SignupField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-normal text-[#252525] ${className}`}>
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

export function AdminSignup({
  onGoLogin,
  onComplete,
}: {
  onGoLogin: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<SignupStep>(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [identityTerms, setIdentityTerms] = useState([false, false, false]);
  const [phoneCodeRequested, setPhoneCodeRequested] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [smsRequestId, setSmsRequestId] = useState("");
  const [signupProof, setSignupProof] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<SignupForm>({
    name: "",
    birthDate: "",
    carrier: "",
    phone: "",
    verificationCode: "",
    address: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    employeeCode: "",
  });

  const update = (field: keyof SignupForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    if (field === "verificationCode") setPhoneVerified(false);
    if (field === "phone") {
      setPhoneCodeRequested(false);
      setPhoneVerified(false);
      setSignupProof("");
    }
    if (field === "employeeCode") setEmployeeVerified(false);
  };

  // 문자 인증번호 요청 (백엔드가 Solapi로 실제 문자 발송)
  const requestPhoneCode = async () => {
    if (!form.name || !form.birthDate || !form.carrier || !form.phone) {
      setMessage("이름, 생년월일, 통신사, 휴대폰 번호를 먼저 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await requestSmsCode(form.phone);
      setSmsRequestId(res.requestId);
      setPhoneCodeRequested(true);
      setMessage("인증번호가 발송되었습니다. 3분 안에 입력해 주세요.");
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 확인 → 회원가입에 쓸 signupProof 받기
  const verifyPhone = async () => {
    if (!phoneCodeRequested || !smsRequestId) {
      setMessage("인증번호를 먼저 요청해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifySmsCode(smsRequestId, form.verificationCode);
      setSignupProof(res.signupProof);
      setPhoneVerified(true);
      setMessage("휴대폰 본인 인증이 완료되었습니다.");
    } catch (err) {
      setPhoneVerified(false);
      setMessage(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyEmployee = () => {
    const valid = form.employeeCode.trim().toUpperCase() === issuedEmployeeCode;
    setEmployeeVerified(valid);
    setMessage(
      valid ? "직원 인증이 완료되었습니다." : "유효하지 않은 직원용 인증번호입니다.",
    );
  };

  // 관리자 회원가입 API 호출
  const submitSignup = async () => {
    setLoading(true);
    try {
      await adminSignup({
        email: form.email.trim(),
        password: form.password,
        phoneNum: form.phone,
        name: form.name.trim(),
        nickname: null,
        address: form.address.trim(),
        signupProof,
      });
      setStep(4);
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setMessage("");
    if (step === 1) {
      if (!termsAccepted) {
        setMessage("필수 약관에 동의해 주세요.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (
        !form.name ||
        !/^\d{8}$/.test(form.birthDate) ||
        !form.carrier ||
        !/^\d{10,11}$/.test(form.phone)
      ) {
        setMessage("본인 인증 정보를 정확히 입력해 주세요.");
        return;
      }
      if (!phoneVerified || identityTerms.some((accepted) => !accepted)) {
        setMessage("인증번호 확인과 필수 동의를 모두 완료해 주세요.");
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (
        !form.address ||
        !form.email ||
        !/^(?=.*[A-Za-z])(?=.*\d)[\x21-\x7E]{10,20}$/.test(form.password)
      ) {
        setMessage("회원 정보를 모두 입력하고 비밀번호 조건(영문·숫자 포함 10~20자, 공백 없음)을 확인해 주세요.");
        return;
      }
      if (!form.passwordConfirmation) {
        setMessage("비밀번호 확인을 입력해 주세요.");
        return;
      }
      if (form.password !== form.passwordConfirmation) {
        setMessage("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
        return;
      }
      if (!employeeVerified) {
        setMessage("회사에서 발급한 직원용 인증번호를 확인해 주세요.");
        return;
      }
      void submitSignup();
    }
  };

  return (
    <div className="min-h-dvh bg-[#f7f7f7] text-[#111827]">
      <AdminAuthHeader actionLabel="로그인으로 이동" onAction={onGoLogin} />

      <main className="mx-auto min-h-[calc(100dvh-72px)] w-full max-w-[1280px] bg-white px-5 py-10 sm:px-10 lg:px-[100px] lg:py-[58px]">
        {step === 4 ? (
          <div className="px-0 sm:px-[30px]">
            <h1 className="font-['EB_Garamond:Medium'] text-[32px] font-medium tracking-[-0.64px]">
              회원가입이 완료되었습니다.
            </h1>
            <p className="mt-2 font-['EB_Garamond:Regular'] text-xl tracking-[-0.4px]">
              로그인하시고 관리자 업무를 시작하세요!
            </p>
            <button
              type="button"
              onClick={onComplete}
              className="mt-12 rounded-[10px] bg-[#1596b4] px-[30px] py-[15px] font-['Inter:Regular'] text-2xl text-white hover:bg-[#117f99] cursor-pointer"
            >
              로그인
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10 lg:gap-[46px]">
            <div className="px-0 sm:px-[30px]">
              <h1 className="font-['EB_Garamond:Medium'] text-[28px] font-medium tracking-[-0.64px] sm:text-[32px]">
                미스터 월드에 오신 것을 환영합니다!
              </h1>
            </div>

            <SignupSteps current={step} />

            {step === 1 && (
              <section className="bg-[#f7f7f7] px-5 py-8 sm:px-[30px] sm:py-[37px]">
                <h2 className="font-['42dot_Sans:SemiBold'] text-xl font-semibold">약관 동의</h2>
                <div className="mt-7 max-h-40 overflow-y-auto border border-[#d7d7d7] bg-white p-5 text-sm leading-7 text-[#555]">
                  미스터 월드 관리자 서비스는 임직원의 업무 처리를 위해 제공됩니다. 계정 정보와 고객 정보를
                  안전하게 관리하고, 회사의 정보보호 및 개인정보 처리 지침을 준수해 주세요.
                </div>
                <label className="mt-6 flex items-center gap-3 text-base cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="size-[19px] accent-[#1596b4]"
                  />
                  위 약관에 동의합니다.
                </label>
              </section>
            )}

            {step === 2 && (
              <section className="border-t border-[#151515] bg-[#f7f7f7] px-5 py-8 font-['42dot_Sans:Regular'] sm:px-[30px]">
                <div className="mb-7">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[22px]">휴대폰 본인인증</h2>
                    <span className="hidden text-xs text-[#666] sm:block">* 표시는 필수 입력 항목입니다.</span>
                  </div>
                  <p className="mt-2 text-sm text-[#666]">
                    본인 명의로 가입된 휴대폰 정보를 정확하게 입력해 주세요.
                  </p>
                </div>

                <div className="grid gap-[22px] sm:grid-cols-2">
                  <SignupField label="이름 *">
                    <input
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="이름을 입력해 주세요"
                      className={signupInput}
                    />
                  </SignupField>
                  <SignupField label="생년월일 *">
                    <input
                      value={form.birthDate}
                      onChange={(event) =>
                        update("birthDate", event.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      inputMode="numeric"
                      placeholder="예: 19900101"
                      className={signupInput}
                    />
                  </SignupField>
                  <SignupField label="통신사 *">
                    <select
                      value={form.carrier}
                      onChange={(event) => update("carrier", event.target.value)}
                      className={signupInput}
                    >
                      <option value="">통신사를 선택해 주세요</option>
                      <option>SKT</option>
                      <option>KT</option>
                      <option>LG U+</option>
                      <option>알뜰폰</option>
                    </select>
                  </SignupField>
                  <SignupField label="휴대폰 번호 *">
                    <div className="flex gap-2.5">
                      <input
                        value={form.phone}
                        onChange={(event) =>
                          update("phone", event.target.value.replace(/\D/g, "").slice(0, 11))
                        }
                        inputMode="numeric"
                        placeholder="숫자만 입력해 주세요"
                        className={signupInput}
                      />
                      <button
                        type="button"
                        onClick={requestPhoneCode}
                        disabled={loading}
                        className="w-[136px] shrink-0 rounded-md bg-[#1596b4] text-sm font-semibold text-white hover:bg-[#117f99] cursor-pointer disabled:opacity-60"
                      >
                        인증번호 요청
                      </button>
                    </div>
                  </SignupField>
                </div>

                <SignupField label="인증번호 *" className="mt-[22px]">
                  <div className="flex gap-2.5">
                    <input
                      value={form.verificationCode}
                      onChange={(event) =>
                        update("verificationCode", event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      placeholder="인증번호 6자리를 입력해 주세요"
                      className={`${signupInput} ${phoneVerified ? "border-[#1596b4]" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={verifyPhone}
                      className="w-[136px] shrink-0 rounded-md border border-[#1596b4] bg-white text-sm font-semibold text-[#1596b4] hover:bg-[#e7f5f7] cursor-pointer"
                    >
                      {phoneVerified ? "인증 완료" : "확인"}
                    </button>
                  </div>
                </SignupField>

                <div className="mt-7 border-t border-[#d7d7d7] pt-6">
                  <h3 className="text-base">필수 동의 안내</h3>
                  <p className="mt-1 text-[13px] text-[#666]">
                    본인확인 서비스 이용을 위해 아래 필수 항목에 동의해 주세요.
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {[
                      "본인확인 서비스 이용약관 동의",
                      "개인정보 수집 및 이용 동의",
                      "고유식별정보 처리 동의",
                    ].map((label, index) => (
                      <label key={label} className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={identityTerms[index]}
                          onChange={(event) =>
                            setIdentityTerms((current) =>
                              current.map((value, itemIndex) =>
                                itemIndex === index ? event.target.checked : value,
                              ),
                            )
                          }
                          className="size-[18px] accent-[#1596b4]"
                        />
                        [필수] {label}
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="bg-[#f7f7f7] px-5 py-8 sm:px-[30px] sm:py-[37px]">
                <div className="grid max-w-[540px] gap-7">
                  <SignupField label="성명">
                    <input value={form.name} readOnly className={`${signupInput} bg-[#f2f2f2]`} />
                  </SignupField>
                  <SignupField label="주소">
                    <input
                      value={form.address}
                      onChange={(event) => update("address", event.target.value)}
                      placeholder="주소를 입력해주세요."
                      className={signupInput}
                    />
                  </SignupField>
                  <SignupField label="연락처">
                    <input value={form.phone} readOnly className={`${signupInput} bg-[#f2f2f2]`} />
                  </SignupField>
                  <SignupField label="아이디 (이메일)">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="admin@misterworld.com"
                      autoComplete="username"
                      className={signupInput}
                    />
                  </SignupField>
                  <SignupField label="비밀번호">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => update("password", event.target.value)}
                      placeholder="비밀번호를 입력해주세요."
                      autoComplete="new-password"
                      className={signupInput}
                    />
                    <p className="mt-2 text-sm text-[#666]">영문자, 숫자를 포함 10~20글자</p>
                  </SignupField>
                  <SignupField label="비밀번호 확인">
                    <input
                      type="password"
                      value={form.passwordConfirmation}
                      onChange={(event) => update("passwordConfirmation", event.target.value)}
                      placeholder="비밀번호를 한 번 더 입력해주세요."
                      autoComplete="new-password"
                      className={`${signupInput} ${
                        form.passwordConfirmation
                          ? form.password === form.passwordConfirmation
                            ? "border-[#1596b4]"
                            : "border-[#c33]"
                          : ""
                      }`}
                    />
                    {form.passwordConfirmation && (
                      <p
                        className={`mt-2 text-sm ${
                          form.password === form.passwordConfirmation
                            ? "text-[#117f99]"
                            : "text-[#c33]"
                        }`}
                      >
                        {form.password === form.passwordConfirmation
                          ? "비밀번호가 일치합니다."
                          : "비밀번호가 일치하지 않습니다."}
                      </p>
                    )}
                  </SignupField>
                  <SignupField label="직원용 인증번호 *">
                    <div className="flex gap-2.5">
                      <input
                        value={form.employeeCode}
                        onChange={(event) => update("employeeCode", event.target.value)}
                        placeholder="회사에서 발급한 인증번호를 입력해주세요."
                        className={`${signupInput} ${employeeVerified ? "border-[#1596b4]" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={verifyEmployee}
                        className="w-[136px] shrink-0 rounded-md border border-[#1596b4] bg-white text-sm font-semibold text-[#1596b4] hover:bg-[#e7f5f7] cursor-pointer"
                      >
                        {employeeVerified ? "인증 완료" : "직원 인증"}
                      </button>
                    </div>
                  </SignupField>
                </div>
              </section>
            )}

            {message && (
              <p
                role="alert"
                className={`-mt-5 text-center text-sm font-medium ${
                  phoneVerified || employeeVerified ? "text-[#117f99]" : "text-[#c33]"
                }`}
              >
                {message}
              </p>
            )}

            <div className="flex justify-center gap-4 sm:gap-10">
              <button
                type="button"
                onClick={() => (step === 1 ? onGoLogin() : setStep((step - 1) as SignupStep))}
                className="h-[54px] w-[150px] rounded-md bg-[#dedede] font-['42dot_Sans:SemiBold'] text-base font-semibold text-[#555] hover:bg-[#d0d0d0] sm:h-[61px] sm:w-[196px] cursor-pointer"
              >
                이전
              </button>
              <button
                type="button"
                onClick={next}
                disabled={loading}
                className="disabled:opacity-60 h-[54px] w-[150px] rounded-md bg-[#1596b4] font-['42dot_Sans:SemiBold'] text-base font-semibold text-white hover:bg-[#117f99] sm:h-[61px] sm:w-[196px] cursor-pointer"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}