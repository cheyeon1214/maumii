import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Title from "../../components/common/Title";
import Collapse from "../../components/common/Collapse";
import { SmsAPI } from "../../api/sms";
import api from "../../api/api";
import { FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [count, setCount] = useState(0); // 재전송 쿨다운(초)
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!/^\d{10,11}$/.test(phone.replaceAll("-", ""))) {
      alert("전화번호를 숫자만 10~11자리로 입력해주세요.");
      return;
    }
    try {
      setSending(true);
      await SmsAPI.sendCode(phone); // 모듈 사용
      setShowCodeInput(true);
      if (!verified) {
        // 인증 성공했으면 더 이상 카운트 안 돌림
        setCount(60);
      }

      const timer = setInterval(() => {
        setCount((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      alert("인증번호를 전송했어요.");
    } catch (e) {
      console.error(e);
      alert("전송 실패. 번호를 확인하거나 잠시 후 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    try {
      setVerifying(true);
      const data = await SmsAPI.verifyCode({ phone, code });
      if (data.ok) {
        +setVerified(true); // 성공 상태 저장
        +setShowCodeInput(false); // (선택) 입력창 닫기
        alert("인증 완료!");
      } else {
        alert(data.message || "인증 번호가 올바르지 않거나 만료되었습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("인증 실패. 다시 시도해주세요.");
    } finally {
      setVerifying(false);
    }
  };

  const pwMismatch = pw && pw2 && pw !== pw2;
  const canSubmit = name && userId && pw && pw2 && !pwMismatch && phone;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      alert("빈 곳을 채워주세요");
      return;
    }

    const payload = { name, userId, pw, phone };
    navigate("/register/detail", { state: payload });
  };
  const handleCheckDuplicate = async () => {
    const id = userId.trim();
    if (!id) {
      setMessage("아이디를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await api.get(`/users/${encodeURIComponent(id)}`);

      if (res.status === 200) {
        // 유저 존재 ⇒ 중복
        setMessage("이미 사용 중인 아이디입니다.");
      } else if (res.status === 404) {
        // 이 케이스는 axios가 throw 하기 때문에 catch로 감
        setMessage("사용 가능한 아이디입니다.");
      } else {
        setMessage("서버 응답을 확인할 수 없습니다.");
      }
    } catch (e) {
      if (e.response?.status === 404) {
        // axios는 404/500 같은 응답을 throw → 여기서 체크
        setMessage("사용 가능한 아이디입니다.");
      } else {
        setMessage("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleCheckDuplicate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
      <div className="mx-auto w-full m-16 max-w-[330px]">
              <Title 
                variant="auth"
                icon={
                  <Link to="/">
                    <FaArrowLeft className="text-lg" />
                  </Link>
                }
              >
                회원가입
              </Title>
            </div>
      <div className="flex-1 overflow-y-auto mx-auto w-full max-w-[330px] px-6 pb-12 space-y-3">
        <Input
          label="이름"
          placeholder="이름을 입력해 주세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex items-end gap-2">
          <Input
            className="flex-1"
            label="아이디"
            placeholder="아이디를 입력해 주세요"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleCheckDuplicate}
            disabled={loading || !userId.trim()}
          >
            {loading ? "확인 중..." : "중복확인"}
          </Button>
        </div>
        {message && (
          <p
            aria-live="polite"
            className={`text-sm ${
              message.includes("사용 가능") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호 확인"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          error={pwMismatch ? "비밀번호가 일치하지 않습니다." : ""}
        />

        {/* 전화번호 + 인증하기 */}
        <div className="flex items-end gap-2">
          <Input
            className="flex-1"
            label="전화번호"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {verified ? (
            <Button variant="outline" disabled={true}>
              인증 완료
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={sendCode}
              disabled={sending || count > 0}
            >
              {count > 0 ? `${count}s` : "인증하기"}
            </Button>
          )}
        </div>

        {/* 인증번호 입력창 (조건부 렌더링) */}
        <Collapse show={showCodeInput} duration={350}>
          <div className="flex items-end gap-2 mt-2">
            <Input
              className="flex-1"
              label="인증번호"
              placeholder="6자리"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={verifyCode} disabled={verifying || verified}>
              확인
            </Button>
          </div>
        </Collapse>
      </div>
      <div className="mx-auto w-full max-w-[330px] px-6 pb-20 space-y-3">
        <div className="pt-2 space-y-1">
          <Button full type="submit">
            다음
          </Button>
          <Link
            to="/login"
            className="text-end block text-sm text-slate-400 hover:underline underline-offset-2"
          >
            로그인
          </Link>
        </div>
      </div>
    </form>
  );
}
