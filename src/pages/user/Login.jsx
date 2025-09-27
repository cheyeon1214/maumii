import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Title from "../../components/common/Title";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaArrowLeft } from "react-icons/fa6";

export default function Login() {
  const { login, isAuth, checked } = useAuth();
  const [uId, setUId] = useState("");
  const [uPwd, setUPwd] = useState("");
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // alert 모달 상태들
  const [loginInput, setLoginInput] = useState(false); // 입력 없음
  const [loginValue, setLoginValue] = useState(false); // 값 일치 오류
  const [loginCall, setLoginCall] = useState(false); // 로그인 실패 오류

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error")) {
      setLoginCall(true);
    }
  }, [location]);
  // 이미 로그인 상태라면 홈으로 보냄
  // 리다이렉트 조건도 로그 추가
  if (checked && isAuth) {
    console.log("=== 로그인 상태여서 /record로 리다이렉트 ===");
    return <Navigate to="/record" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!uId || !uPwd) {
      setLoginInput(true);
      return;
    }
    try {
      await login(uId, uPwd); // Context의 login 함수 호출 → 세션 저장
      navigate("/record"); // 로그인 성공 후 홈으로 이동
    } catch {
      setLoginValue(true);
    }
  };

  console.log("Login 컴포넌트 렌더링:", {
    isAuth,
    checked,
    user: "유저정보숨김",
    "checked && isAuth": checked && isAuth,
  });

  return (
    <>
    <form onSubmit={onSubmit} className="flex-1 bg-white">
      <div className="mx-auto w-full m-16 max-w-[330px]">
        <Title 
          variant="auth"
          icon={
            <Link to="/">
              <FaArrowLeft className="text-lg" />
            </Link>
          }
        >
          로그인
        </Title>
      </div>

      <div className="mx-auto w-full max-w-[330px] px-6 pb-24 space-y-4">
        <Input
          label="아이디"
          placeholder="아이디를 입력해 주세요"
          value={uId}
          onChange={(e) => setUId(e.target.value)}
        />
        <Input
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요"
          type="password"
          value={uPwd}
          onChange={(e) => setUPwd(e.target.value)}
        />
        <div className="pt-2 space-y-1">
          <Button full type="submit">
            로그인
          </Button>
          <Link
            to="/register"
            className="text-end block text-sm text-slate-400 hover:underline underline-offset-2"
          >
            회원가입
          </Link>
        </div>
        {/*  옵션: 소셜 로그인 섹션
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-sm text-slate-500">
              다른 로그인
            </span>
          </div>
        </div>
        <Button
          full
          variant="outline"
          disabled={kakaoLoading}
          onClick={() => {
            if (kakaoLoading) return;
            setKakaoLoading(true);
            window.location.href = "http://localhost:9000/oauth2/authorization/kakao";
          }}
        >
        {kakaoLoading ? "연결 중..." : "KAKAO로 로그인"}
        </Button>
        <Button full variant="outline" onClick={() => alert("NAVER 로그인")}>
          NAVER로 로그인
        </Button>
        <Button full variant="outline" onClick={() => alert("Google 로그인")}>
          Google로 로그인
        </Button> */}
      </div>
    </form>
    <ConfirmModal
      isOpen={loginInput}
      mode="alert"
      title="아이디와 비밀번호를 모두 입력해주세요."
      onCancel={() => setLoginInput(false) }
    />

    <ConfirmModal
      isOpen={loginValue}
      mode="alert"
      title="아이디 혹은 비밀번호가 올바르지 않습니다."
      onCancel={() => setLoginValue(false) }
    />

    <ConfirmModal
      isOpen={loginCall}
      mode="alert"
      title="로그인에 실패했습니다. "
      description="다시 시도해주세요."
      onCancel={() => setLoginCall(false) }
    />
    </>
  );
}
