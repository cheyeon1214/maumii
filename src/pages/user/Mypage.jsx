import { useState } from "react";
import Title from "../../components/common/Title";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function Mypage() {
  const { user, logout } = useAuth();
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  const [logoutCall, setLogoutCall] = useState(false); // alert 모달 상태들

  const handleLogout = async () => {
    try {
      // await axios.post(`http://localhost:9000/api/auth/logout`);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[330px]">
      <Title variant="default" className="mt-12 mb-[40px] text-center">
        마이페이지
      </Title>
      <div className="grid place-items-center text-center space-y-4 p-5">
        <div
          className="w-32 h-32 shadow-[0_0px_8px_rgba(169,96,176,0.4)]"
          style={{ borderRadius: "10px" }}
        >
          <img
            src={themeConfig.profileImage}
            alt="User Avatar"
            className="w-full h-full object-cover rounded-[10px] px-1 py-2"
          />
        </div>
        <h2
          className="text-lg font-semibold"
          style={{ letterSpacing: "5px", display: "inline-block" }}
        >
          {user?.uName || "차은우"}
        </h2>
      </div>
      <div className="mt-6 space-y-5">
        <Link
          to="/mypage/edit"
          className="h-7 mx-5 flex justify-between items-center"
        >
          <span className="font-bold text-gray-500">프로필 정보 변경</span>
          <IoIosArrowForward className="text-gray-500" />
        </Link>
        <Link
          to="/mypage/protector"
          className="h-7 mx-5 flex justify-between items-center"
        >
          <span className="font-bold text-gray-500">나의 보호자 관리</span>
          <IoIosArrowForward className="text-gray-500" />
        </Link>
        <Link to="/record-list" className="h-7 mx-5 flex justify-between items-center">
          <span className="font-bold text-gray-500">나의 대화 기록</span>
          <IoIosArrowForward className="text-gray-500" />
        </Link>
        <Link
          to="/mypage/theme"
          className="h-7 mx-5 flex justify-between items-center"
        >
          <span className="font-bold text-gray-500">테마 변경</span>
          <IoIosArrowForward className="text-gray-500" />
        </Link>
      </div>
      <div className="mt-10">
        <button
          onClick={() => setLogoutCall(true)}
          className="text-center flex justify-center items-center w-full cursor-pointer"
        >
          <FaArrowRightToBracket className="mr-2 text-sm text-gray-400" />
          <span className="text-sm text-gray-400">로그아웃</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={logoutCall}
        title="정말 로그아웃 하시겠습니까? "
        onConfirm={async () => {
          try {
            await handleLogout(); // logout 실행
            setLogoutCall(false); // 모달 닫기
          } catch (err) {
            console.error("로그아웃 실패:", err);
          }
        }}
        onCancel={() => setLogoutCall(false)}
      />
    </div>
  );
}
