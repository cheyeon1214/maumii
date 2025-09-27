// src/pages/RegisterDetail.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Title from "../../components/common/Title";
import Button from "../../components/common/Button";
import ThemeSelector from "../../components/ThemeSelector";
import LevelSelector from "../../components/LevelSelector";
import api from "../../api/api";

export default function RegisterDetail() {
  const { state } = useLocation(); // 1단계 데이터
  const navigate = useNavigate();

  const [theme, setTheme] = useState("cloud");
  const [level, setLevel] = useState("all");

  useEffect(() => {
    if (!state) navigate("/register", { replace: true }); // 가드
  }, [state, navigate]);

  const canSubmit = !!theme && !!level;

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const finalPayload = {
      uId: state.userId,
      uName: state.name,
      uPwd: state.pw,
      uPhone: state.phone,
      uTheme: theme,
      uExposure: level === "all",
    };

    try {
  const res = await api.post("/auth/signup", finalPayload);

  // axios는 200~299 응답이면 여기로 들어옴
  console.log("회원가입 응답:", res.data);
  alert("회원가입 성공!");
} catch (err) {
  // axios는 4xx/5xx 에러일 때 catch로 바로 들어옴
  if (err.response) {
    console.error("회원가입 실패:", err.response.status, err.response.data);
    alert("회원가입 실패: " + err.response.status);
  } else {
    console.error("네트워크 오류:", err);
    alert("네트워크 오류가 발생했습니다.");
  }
}
  };

  if (!state) return null;

  return (
    <form onSubmit={handleFinish} className="flex-1 bg-white">
      <div className="m-16">
        <Title variant="auth">회원가입</Title>
      </div>

      <div className="mx-auto w-full max-w-[330px] px-5 pb-16 space-y-6">
        <ThemeSelector theme={theme} setTheme={setTheme} />
        <LevelSelector level={level} setLevel={setLevel} />

        {/* 가입 버튼 */}
        <div className="pt-1">
          <Button full type="submit" disabled={!canSubmit}>
            회원가입
          </Button>
        </div>
      </div>
    </form>
  );
}
