import React, { useState, type FormEvent, type ReactNode } from "react";

const asset = (name: string) => `/assets/${name}`;

function CustomerBrand({ onHome }: { onHome?: () => void }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        if (onHome) {
          e.preventDefault();
          onHome();
        }
      }}
      className="flex items-center gap-[10px] cursor-pointer"
    >
      <div className="relative h-10 w-[39px] shrink-0 overflow-hidden">
        <img
          src={asset("5e724.png")}
          alt="미스터 월드"
          className="pointer-events-none absolute left-[-52.17%] top-[-47.88%] h-[198.61%] w-[204.33%] max-w-none"
        />
      </div>
      <span className="font-['EB_Garamond:Bold'] text-xl font-bold tracking-[-0.44px] text-[#1596b4] sm:text-[22px] whitespace-nowrap">
        미스터 월드
      </span>
    </a>
  );
}

function CustomerAuthHeader({
  onHome,
  actionLabel,
  onAction,
}: {
  onHome?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <header className="flex h-[72px] w-full items-center justify-between border-b border-[#dde4e8] bg-white px-4 sm:px-7">
      <CustomerBrand onHome={onHome} />
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

export function CustomerLogin({
  onHome,
  onLoginSuccess,
  onGoSignup,
}: {
  onHome?: () => void;
  onLoginSuccess: (email: string) => void;
  onGoSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    onLoginSuccess(email);
  };

  return (
    <div className="min-h-dvh bg-[#f7f7f7]">
      <CustomerAuthHeader onHome={onHome} />
      <main className="mx-auto min-h-[calc(100dvh-72px)] w-full max-w-[1280px] bg-white px-5 py-10 sm:px-10 lg:px-[100px] lg:py-16">
        <section className="flex min-h-[450px] items-center justify-center bg-[#f7f7f7]/85 px-5 py-[37px]">
          <form className="w-full max-w-[500px]" onSubmit={submit}>
            <label className="mb-[30px] block font-['EB_Garamond:Regular'] text-xl">
              아이디 (이메일)
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해 주세요."
                className="mt-2.5 h-[50px] w-full border border-black bg-white px-5 text-base outline-none focus:border-[#1596b4]"
              />
            </label>
            <label className="mb-[30px] block font-['EB_Garamond:Regular'] text-xl">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해 주세요."
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
              회원가입
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

type SignupStep = 1 | 2 | 3 | 4;

type CustomerSignupForm = {
  name: string;
  birthDate: string;
  carrier: string;
  phone: string;
  verificationCode: string;
  address: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

const demoPhoneCode = "123456";

const signupInput =
  "h-12 w-full rounded-[4px] border border-[#9a9a9a] bg-white px-3.5 font-['42dot_Sans:Regular'] text-[15px] outline-none placeholder:text-[#8a8a8a] focus:border-[#1596b4]";

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
              <span className="mt-2 text-xl text-[#b0b0b0] sm:mt-2.5 sm:text-2xl">›</span>
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

export function CustomerSignup({
  onHome,
  onGoLogin,
  onComplete,
}: {
  onHome?: () => void;
  onGoLogin: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<SignupStep>(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [identityTerms, setIdentityTerms] = useState([false, false, false]);
  const [phoneCodeRequested, setPhoneCodeRequested] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<CustomerSignupForm>({
    name: "",
    birthDate: "",
    carrier: "",
    phone: "",
    verificationCode: "",
    address: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const update = (field: keyof CustomerSignupForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    if (field === "verificationCode") setPhoneVerified(false);
  };

  const requestPhoneCode = () => {
    if (!form.name || !form.birthDate || !form.carrier || !form.phone) {
      setMessage("이름, 생년월일, 통신사, 휴대폰 번호를 먼저 입력해 주세요.");
      return;
    }
    setPhoneCodeRequested(true);
    setMessage(`인증번호가 발송되었습니다. 데모 인증번호는 ${demoPhoneCode}입니다.`);
  };

  const verifyPhone = () => {
    const valid = phoneCodeRequested && form.verificationCode === demoPhoneCode;
    setPhoneVerified(valid);
    setMessage(valid ? "휴대폰 본인 인증이 완료되었습니다." : "인증번호를 확인해 주세요.");
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
        !/^(?=.*[A-Za-z])(?=.*\d).{10,}$/.test(form.password)
      ) {
        setMessage("회원 정보를 모두 입력하고 비밀번호 조건(영문·숫자 포함 10자 이상)을 확인해 주세요.");
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
      setStep(4);
    }
  };

  return (
    <div className="min-h-dvh bg-[#f7f7f7] text-[#111827]">
      <CustomerAuthHeader onHome={onHome} actionLabel="로그인으로 이동" onAction={onGoLogin} />

      <main className="mx-auto min-h-[calc(100dvh-72px)] w-full max-w-[1280px] bg-white px-5 py-10 sm:px-10 lg:px-[100px] lg:py-[58px]">
        {step === 4 ? (
          <div className="px-0 sm:px-[30px]">
            <h1 className="font-['EB_Garamond:Medium'] text-[32px] font-medium tracking-[-0.64px]">
              회원가입이 완료되었습니다!
            </h1>
            <p className="mt-2 font-['EB_Garamond:Regular'] text-xl tracking-[-0.4px]">
              로그인하시고 특별한 테마 여행을 시작해 보세요.
            </p>
            <button
              type="button"
              onClick={onComplete}
              className="mt-12 rounded-[10px] bg-[#1596b4] px-[30px] py-[15px] font-['Inter:Regular'] text-2xl text-white hover:bg-[#117f99] cursor-pointer"
            >
              로그인하기
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

            {/* 1단계: 고객용 서비스 이용약관 */}
            {step === 1 && (
              <section className="bg-[#f7f7f7] px-5 py-8 sm:px-[30px] sm:py-[37px]">
                <h2 className="font-['42dot_Sans:SemiBold'] text-xl font-semibold">약관 동의</h2>
                <div className="mt-7 max-h-40 overflow-y-auto border border-[#d7d7d7] bg-white p-5 text-sm leading-7 text-[#555]">
                  미스터 월드 테마 투어 회원 서비스 이용약관 및 개인정보 처리방침 안내입니다.
                  고객님의 소중한 개인정보는 예약 진행 및 여행 서비스 제공 목적 이외에는 사용되지 않습니다.
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

            {/* 2단계: 본인 인증 */}
            {step === 2 && (
              <section className="border-t border-[#151515] bg-[#f7f7f7] px-5 py-8 font-['42dot_Sans:Regular'] sm:px-[30px]">
                <div className="mb-7">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[22px]">휴대폰 본인인증</h2>
                    <span className="hidden text-xs text-[#666] sm:block">* 표시는 필수 입력 항목입니다.</span>
                  </div>
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
                        className="w-[136px] shrink-0 rounded-md bg-[#1596b4] text-sm font-semibold text-white hover:bg-[#117f99] cursor-pointer"
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

            {/* 3단계: 회원 정보 등록 (직원용 인증번호 항목 제거됨) */}
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
                      placeholder="user@example.com"
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
                    <p className="mt-2 text-sm text-[#666]">영문자, 숫자를 포함 10글자 이상</p>
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
                </div>
              </section>
            )}

            {message && (
              <p
                role="alert"
                className={`-mt-5 text-center text-sm font-medium ${
                  phoneVerified ? "text-[#117f99]" : "text-[#c33]"
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
                className="h-[54px] w-[150px] rounded-md bg-[#1596b4] font-['42dot_Sans:SemiBold'] text-base font-semibold text-white hover:bg-[#117f99] sm:h-[61px] sm:w-[196px] cursor-pointer"
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