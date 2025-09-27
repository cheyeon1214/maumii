import { useEffect, useState } from "react";
import Title from "../../components/common/Title";
import Button from "../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import ThemeSelector from "../../components/ThemeSelector";
import LevelSelector from "../../components/LevelSelector";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function MypageTheme() {
  const [theme, setTheme] = useState("cloud");
  const [level, setLevel] = useState("false");
  const [loading, setLoading] = useState(false);

  // 알럿 모달 상태들s
  const [showNoChange, setShowNoChange] = useState(false); // 변경사항 없음
  const [showMissingUser, setShowMissingUser] = useState(false); // 사용자 없음
  const [showSaved, setShowSaved] = useState(false); // 저장 성공
  const [errorMsg, setErrorMsg] = useState(""); // 에러

  const { user, updateUserInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setTheme(user.uTheme || "cloud");
      setLevel(user.uExposure ? "false" : "true");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user?.uId) {
      setShowMissingUser(true);
      return;
    }

    const currentTheme = user.uTheme || "cloud";
    const currentExposure = user.uExposure ? "false" : "true"; //true일때 필터 적용

    if (currentTheme === theme && currentExposure === level) {
      setShowNoChange(true);
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        uTheme: theme,
        uExposure: level === "false",
      };

      await api.put(`/users/${user.uId}/preference`, requestData);

      updateUserInfo({
        uTheme: requestData.uTheme,
        uExposure: requestData.uExposure,
      });
      setShowSaved(true);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("테마 설정 업데이트 실패:", status, data, err);
      let msg = "저장에 실패했습니다.";
      if (data?.message) msg = data.message;
      else if (status === 404) msg = "사용자를 찾을 수 없습니다.";
      else if (status === 400) msg = "입력 정보를 확인해주세요.";
      else if (status === 401) msg = "로그인이 필요합니다.";
      else if (status === 403) msg = "권한이 없습니다.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[330px]">
        <Title variant="default" className="mt-10">
          테마 변경
        </Title>
        <div className="text-center mt-20">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link to="/login">
            <Button>로그인하러 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[330px]">
      <Title
        variant="default"
        className="mt-10"
        icon={
          <Link to="/mypage">
            <FaArrowLeft className="text-lg" />
          </Link>
        }
      >
        테마 변경
      </Title>

      <div className="px-5 py-16 space-y-6">
        <ThemeSelector theme={theme} setTheme={setTheme} />
        <LevelSelector level={level} setLevel={setLevel} />

        <div className="pt-1">
          <Button full onClick={handleSubmit} disabled={loading}>
            {loading ? "저장중..." : "변경하기"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showNoChange}
        mode="alert"
        title="변경 사항이 없습니다."
        description={`현재 설정과 동일합니다.\n변경 후 저장을 눌러주세요.`}
        onCancel={() => setShowNoChange(false)}
      />

      <ConfirmModal
        isOpen={showMissingUser}
        mode="alert"
        title="로그인이 필요합니다"
        description="사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요."
        onCancel={() => {
          setShowMissingUser(false);
          navigate("/login");
        }}
      />

      <ConfirmModal
        isOpen={showSaved}
        mode="alert"
        title="저장 완료"
        description="테마 설정이 저장되었습니다."
        onCancel={() => {
          setShowSaved(false);
          // window.location.reload(); // 기존 동작 유지
        }}
      />

      <ConfirmModal
        isOpen={!!errorMsg}
        mode="alert"
        title="오류"
        description={errorMsg}
        onCancel={() => setErrorMsg("")}
      />
    </div>
  );
}
