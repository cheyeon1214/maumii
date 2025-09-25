import { useEffect, useState } from "react";
import Title from "../components/Title";
import Input from "../components/Input";
import Button from "../components/Button";
import Collapse from "../components/Collapse";
import ConfirmModal from "../components/ConfirmModal";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { FaCirclePlus } from "react-icons/fa6";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Protector() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // 인증코드
  const [list, setList] = useState([]); // 등록된 이메일 리스트
  const [showCodeInput, setShowCodeInput] = useState(false); // 추가 폼
  const [open, setOpen] = useState(false); // 모달 열린 상태
  const [targetProtector, setTargetProtector] = useState(null); // 삭제할 보호자 정보
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { user } = useAuth();

  // 처음 렌더링 시 DB에서 기존 데이터 불러오기
  useEffect(() => {
    const fetchProtectors = async () => {
      if (!user?.uId) return;

      try {
        setLoading(true);
        // GET /api/users/{uId}/protectors - 컨트롤러와 일치
        const response = await api.get(`/users/${user.uId}/protectors`);
        console.log("보호자 목록:", response.data);
        setList(response.data || []);
      } catch (error) {
        console.error("보호자 목록 조회 실패:", error);
        if (error?.response?.status !== 404) {
          alert("보호자 목록을 불러오는데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProtectors();
  }, [user]);

  // 이메일 형식 검증
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canSubmit = email.trim() && code.trim() && isVerified;

  // 인증코드 발송
  const handleSendCode = async () => {
    if (!user?.uId) {
      alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    try {
      setSendLoading(true);

      // POST /api/users/{uId}/protectors/send-code
      await api.post(`/users/${user.uId}/protectors/send-code`, null, {
        params: { email: email.trim() },
      });

      setIsCodeSent(true);
      setIsVerified(false);
      alert("인증코드가 발송되었습니다. 이메일을 확인해주세요.");
    } catch (error) {
      console.error("인증코드 발송 실패:", error);

      let errorMessage = "인증코드 발송에 실패했습니다.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 400) {
        errorMessage = "잘못된 이메일 주소입니다.";
      }

      alert(errorMessage);
    } finally {
      setSendLoading(false);
    }
  };

  // 인증코드 확인
  const handleVerifyCode = async () => {
    if (!user?.uId) {
      alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!code.trim()) {
      alert("인증코드를 입력해주세요.");
      return;
    }

    try {
      setVerifyLoading(true);

      // POST /api/users/{uId}/protectors/verify-code
      await api.post(`/users/${user.uId}/protectors/verify-code`, null, {
        params: {
          email: email.trim(),
          code: code.trim(),
        },
      });

      setIsVerified(true);
      alert("이메일 인증이 완료되었습니다.");
    } catch (error) {
      console.error("인증코드 확인 실패:", error);

      let errorMessage = "인증코드가 올바르지 않습니다.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setVerifyLoading(false);
    }
  };

  // 보호자 추가
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.uId) {
      alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!canSubmit) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    try {
      setAddLoading(true);

      // POST /api/users/{uId}/protectors - 컨트롤러와 일치
      const response = await api.post(
        `/users/${user.uId}/protectors`,
        null,
        {
          params: { pEmail: email.trim() },
        }
      );

      console.log("보호자 추가 성공:", response.data);

      window.location.reload();
      // 화면 업데이트
      setList((prev) => [...prev, response.data]);

      // 폼 초기화
      setEmail("");
      setCode("");
      setIsCodeSent(false);
      setIsVerified(false);
      setShowCodeInput(false);

      alert("보호자가 성공적으로 등록되었습니다.");
    } catch (error) {
      console.error("보호자 추가 실패:", error);

      let errorMessage = "보호자 등록에 실패했습니다.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 400) {
        errorMessage = "잘못된 이메일이거나 이미 등록된 보호자입니다.";
      } else if (error?.response?.status === 404) {
        errorMessage = "해당 이메일의 사용자를 찾을 수 없습니다.";
      }

      alert(errorMessage);
    } finally {
      setAddLoading(false);
    }
  };

  // 보호자 삭제
  const handleDelete = async () => {
    if (!targetProtector || !user?.uId) return;

    try {
      await api.delete(
        `/users/${user.uId}/protectors/${targetProtector.pId}`
      );

      // 로컬 state에서도 삭제
      setList((prev) =>
        prev.filter((item) => item.pId !== targetProtector.pId)
      );

      // 모달 닫기
      setOpen(false);
      setTargetProtector(null);

      alert("보호자가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("보호자 삭제 실패:", error);

      let errorMessage = "보호자 삭제에 실패했습니다.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 404) {
        errorMessage = "삭제할 보호자를 찾을 수 없습니다.";
      }

      alert(errorMessage);
    }
  };

  // 로그인하지 않은 사용자 처리
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[330px]">
        <Title variant="default" className="my-10">
          보호자 관리
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
        className="my-10"
        icon={
          <Link to="/mypage">
            <FaArrowLeft className="text-lg" />
          </Link>
        }
      >
        보호자 관리
      </Title>

      <div className="px-6 space-y-3 mb-4">
        <span className="font-bold text-400">등록된 이메일</span>

        {loading ? (
          <div className="text-center py-4">
            <span className="text-300">로딩 중...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-4">
            <span className="text-300">등록된 보호자가 없습니다.</span>
          </div>
        ) : (
          list.map((protector) => (
            <div
              key={protector.pId}
              className="bg-gray-100 flex justify-between items-center px-2 py-2 shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
              style={{ borderRadius: "10px" }}
            >
              <span className="pl-2 font-semibold text-300">
                {protector.pEmail}
              </span>
              <button
                onClick={() => {
                  setTargetProtector(protector);
                  setOpen(true);
                }}
              >
                <span
                  className="bg-white text-xs font-medium px-2 py-1"
                  style={{ borderRadius: "10px" }}
                >
                  삭제
                </span>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="px-6 my-10 cursor-pointer">
        <div
          className="grid place-items-center border py-1 shadow-[0_1px_4px_rgba(166,144,255,0.4)]"
          style={{ borderRadius: "10px" }}
          onClick={() => setShowCodeInput(true)}
        >
          <FaCirclePlus className="text-primary" />
        </div>
      </div>

      <ConfirmModal
        isOpen={open}
        title="보호자 이메일을 삭제하시겠습니까?"
        description="보호자 해제 메일이 발송됩니다."
        onConfirm={handleDelete}
        onCancel={() => {
          setOpen(false);
          setTargetProtector(null);
        }}
      />

      <Collapse show={showCodeInput} duration={350}>
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto bg-white"
        >
          <div className="mx-auto w-full max-w-[330px] px-6 pb-24 space-y-3">
            {/* 이메일 + 인증하기 */}
            <div className="flex items-end gap-2">
              <Input
                className="flex-1"
                label="이메일"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsCodeSent(false);
                  setIsVerified(false);
                }}
                placeholder="전체 이메일 입력"
                disabled={isVerified}
              />
              <Button
                variant="outline"
                type="button"
                onClick={handleSendCode}
                disabled={!email.trim() || sendLoading || isVerified}
              >
                {sendLoading
                  ? "발송중..."
                  : isVerified
                  ? "인증완료"
                  : "인증하기"}
              </Button>
            </div>

            {/* 인증번호 입력창 */}
            {isCodeSent && !isVerified && (
              <div className="flex items-end gap-2">
                <Input
                  className="flex-1"
                  label="인증번호"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6자리"
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={!code.trim() || verifyLoading}
                >
                  {verifyLoading ? "확인중..." : "확인"}
                </Button>
              </div>
            )}

            {/* 인증 상태 표시 */}
            {isVerified && (
              <div className="text-center py-2">
                <span className="text-green-600 font-medium">
                  ✓ 이메일 인증이 완료되었습니다
                </span>
              </div>
            )}

            <div className="pt-5">
              <Button full type="submit" disabled={!canSubmit || addLoading}>
                {addLoading ? "등록 중..." : "저장하기"}
              </Button>
            </div>
          </div>
        </form>
      </Collapse>
    </div>
  );
}
