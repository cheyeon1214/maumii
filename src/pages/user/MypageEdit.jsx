import Title from "../../components/common/Title";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function MypageEdit() {
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  // 화면에서 "확인" 누른 값 (서버로 보낼 준비된 값)
  const [staged, setStaged] = useState({});
  const [loading, setLoading] = useState(false);

  const { user, updateUserInfo } = useAuth();
  const { themeConfig } = useTheme();

  // alert 모달 상태들
  const [phoneInsert, setPhoneInsert] = useState(false); // 전화번호 입력 없음
  const [phoneType, setPhoneType] = useState(false); // 전화번호 형식 오류
  const [pwInsert, setPwInsert] = useState(false); // 비밀번호 입력 없음
  const [pwLength, setPwLength] = useState(false); // 비밀번호 길이 오류

  const canSave = useMemo(() => Object.keys(staged).length > 0, [staged]);

  const stagePhone = () => {
    if (!phone.trim()) {
      setPhoneInsert(true);
      return;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone.trim())) {
      setPhoneType(true);
      return;
    }

    setStaged((prev) => ({ ...prev, uPhone: phone.trim() }));
  };

  const stagePw = () => {
    if (!pw.trim()) {
      setPwInsert(true);
      return;
    }

    if (pw.trim().length < 4) {
      setPwLength(true);
      return;
    }

    setStaged((prev) => ({ ...prev, uPwd: pw.trim() }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || loading) return;

    // 사용자 ID가 없으면 처리할 수 없음
    if (!user?.uId) {
      alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      setLoading(true);

      // PUT /api/users/{uId}/account - 컨트롤러와 일치
      await api.put(`/users/${user.uId}/account`, staged, {
        headers: { "Content-Type": "application/json" },
      });

      alert("저장되었습니다.");
      window.location.reload();
      // 성공 후 초기화
      setStaged({});
      setPw("");
      setPhone("");
    } catch (err) {
      console.error("계정 정보 업데이트 실패:", err);

      // 에러 메시지 처리
      let errorMessage = "저장에 실패했습니다.";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.status === 404) {
        errorMessage = "사용자를 찾을 수 없습니다.";
      } else if (err?.response?.status === 400) {
        errorMessage = "입력 정보를 확인해주세요.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 로그인하지 않은 사용자 처리
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[330px]">
        <Title variant="default" className="mt-10">
          프로필 변경
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
        프로필 변경
      </Title>

      <div className="grid place-items-center text-center space-y-4 p-5">
        <div
          className="w-32 h-32 shadow-[0_0px_8px_rgba(169,96,176,0.4)]"
          style={{ borderRadius: "10px" }}
        >
          <img
             src={themeConfig.profileImage} // 경로 하드코딩 제거
            alt="User Avatar"
            className="w-full h-full object-cover rounded-[10px] px-1 py-2"
          />
        </div>
        <h2
          className="text-lg font-bold"
          style={{ letterSpacing: "5px", display: "inline-block" }}
        >
          {user?.uName || "마음이"}
        </h2>
      </div>

      <form className="overflow-y-auto h-full bg-white" onSubmit={onSubmit}>
        {/* 전화번호 */}
        <div className="flex items-end gap-2 mt-6 px-1">
          <Input
            className="flex-1"
            label="전화번호 변경하기"
            placeholder={user?.uPhone || "010-0000-0000"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={stagePhone}>
            확인
          </Button>
        </div>

        {/* 비밀번호 */}
        <div className="flex items-end gap-2 mt-6 px-1">
          <Input
            className="flex-1"
            label="비밀번호 변경하기"
            type="password"
            placeholder="새 비밀번호 (4자 이상)"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={stagePw}>
            확인
          </Button>
        </div>

        {/* 저장 예정 표시 */}
        {canSave && (
          <div className="text-xs text-gray-500 mt-3 px-1">
            저장 예정:{" "}
            {[
              staged.uPhone ? `전화번호(${staged.uPhone})` : null,
              staged.uPwd ? "비밀번호" : null,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
        )}

        <div className="pt-1 mt-16">
          <Button full type="submit" disabled={!canSave || loading}>
            {loading ? "저장중..." : "저장하기"}
          </Button>
        </div>
      </form>

      {/* alert 창 */}
      <ConfirmModal
        isOpen={phoneInsert}
        mode="alert"
        title="전화번호를 입력해주세요."
        onCancel={() => setPhoneInsert(false) }
      />

      <ConfirmModal
        isOpen={phoneType}
        mode="alert"
        title="전화번호 형식을 확인해주세요."
        description="예 : 010-1234-5678"
        onCancel={() => setPhoneType(false) }
      />

      <ConfirmModal
        isOpen={pwInsert}
        mode="alert"
        title="비밀번호를 입력해주세요."
        onCancel={() => setPwInsert(false) }
      />

      <ConfirmModal
        isOpen={pwLength}
        mode="alert"
        title="비밀번호 길이를 확인해주세요."
        description="비밀번호는 4자 이상 설정 가능합니다"
        onCancel={() => setPwLength(false) }
      />

    </div>
  );
}
