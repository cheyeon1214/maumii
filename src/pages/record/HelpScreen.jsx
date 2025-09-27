import { motion } from "framer-motion";
import { FaBook } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import RecordButton from "../../components/RecordButton";

/** 위/아래 세로 화살표 */
function VerticalArrow({ dir = "down", className = "" }) {
  const flip = dir === "up" ? "-scale-y-100" : "";
  return (
    <svg viewBox="0 0 24 140" className={`${className} ${flip}`} fill="none">
      <line
        x1="12"
        y1="0"
        x2="12"
        y2="120"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M2 112 L12 140 L22 112 Z" fill="currentColor" />
    </svg>
  );
}

function CurvedArrowLeft({ className = "" }) {
  return (
    <svg viewBox="0 0 90 120" className={className} fill="none">
      <path
        d="M105 85 C 105 40, 60 35, 25 25"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M28 18 L5 28 L22 40 Z" fill="currentColor" />
    </svg>
  );
}

export default function HelpScreen({ onClose }) {
  return (
    <div className="absolute inset-0 z-[100]">
      {/* 반투명 배경 (클릭 시 닫힘) */}
      <motion.div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* 내용: 텍스트/화살표 (배경 클릭 닫힘 유지 위해 pointer-events-none) */}
      <motion.div
        className="absolute inset-0 text-notice pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* 1) 상단 안내문 */}
        <div className="m-8">
          <FaBook className="cursor-pointer text-white h-5 w-5" />
        </div>
        <div className="absolute left-20 top-6 font-semibold leading-tight text-[16px]">
          이모티콘이 어떤 감정인지 궁금하다면
          <br />
          감정 카드를 눌러서 확인해보세요!
        </div>
        {/* <div className="mx-auto mt-9 w-20 h-20 rounded-full bg-white border-4 border-cloud-partner flex items-center justify-center">
                <span className="w-12 h-12">
                    <img src="src/assets/images/구르미.svg"></img>
                </span>
            </div> */}
        {/* <RecordButton
          role="partner"
          className="absolute left-1/2 -translate-x-1/2 top-1 h-20 w-20 text-notice"
        /> */}

        {/* 1-1) 상단 작은 원(카드) 위치로 향하는 '위쪽' 세로 화살표 */}
        {/* 작은 원이 화면 상단 중앙 부근에 있다고 가정하여 중앙 조금 아래에서 위로 향하게 배치 */}
        <VerticalArrow
          dir="up"
          className="absolute left-1/2 -translate-x-1/2 top-[26%] h-16 w-6 text-notice"
        />

        {/* 2) 가운데 안내문 (큰 캐릭터 위에 걸치도록 중앙 배치) */}
        <div className="absolute left-1/2 top-[45%] md:top-[47%] w-80 -translate-x-1/2 -translate-y-1/2 text-center font-semibold text-[18px]">
          꾹~ 눌러서 녹음해주세요!
          <br />
          구르미가 감정을 표현해드립니다
        </div>

        {/* 2-1) 중앙에서 마이크(아래 작은 원)로 내려가는 '아래' 세로 화살표 */}
        <VerticalArrow
          dir="down"
          className="absolute left-1/2 -translate-x-1/2 top-[55%] md:top-[55%] h-16 w-6 text-notice"
        />
        {/* main 여기서 여러가지 비동기 동작 */}
        <div className="h-[40%] grid place-items-center">
          <div className="flex flex-col items-center"></div>
        </div>

        {/* 내 버튼 */}
        {/* <RecordButton
          role="me"
          className="absolute left-1/2 -translate-x-1/2 -bottom-20 md:bottom-38 h-20 w-20 text-notice"
        /> */}
        {/* <div className="cursor-pointer m-auto mt-8 w-20 h-20 rounded-full bg-white border-4 border-cloud-mine flex items-center justify-center">
          <span className="w-12 h-12">
            <img src="src/assets/images/구르미.svg" />
          </span>
        </div> */}
        {/* 3) 하단 안내문 (탭바 “기록” 방향) */}
        <div className="absolute left-16 bottom-[120px] md:bottom-38 font-semibold text-[16px]">
          녹음한 대화 기록을 확인할 수 있어요
        </div>

        {/* 3-1) 좌하단 곡선 화살표: 좌하단에서 위/오른쪽을 향하도록 회전 */}
        {/* 3-1) 좌하단 곡선 화살표: 좌하단에서 위/왼쪽을 향하도록 */}
        <CurvedArrowLeft className="absolute left-10 bottom-[70px] md:bottom-23 w-28 h-11 text-notice rotate-[260deg]" />
        <div className="absolute left-[74px] bottom-11 text-white">
          <FaBoxArchive className="w-[20px] h-[20px]" />
        </div>
      </motion.div>
    </div>
  );
}
