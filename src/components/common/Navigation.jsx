import { useMemo } from "react";
import { FaBoxArchive } from "react-icons/fa6";
import { IoPerson } from "react-icons/io5";

/** 사용법
 * <BottomNav active="mic" onChange={(key) => setActive(key)} />
 * active: 'record' | 'mic' | 'mypage'
 */
export default function Navigation({ active = "mic", onChange }) {
  const is = (k) => active === k;

  // 공통 스타일
  const tabBase =
    "flex flex-col h-16 flex-1 items-center justify-center gap-1.5 rounded-2xl transition";
  const labelBase = "text-xs font-medium";

  // 색상(활성/비활성)
  const tone = useMemo(
    () => ({
      icon: (k) => (is(k) ? "text-icon" : "text-button-none"),
      text: (k) => (is(k) ? "text-icon" : "text-button-none"),
    }),
    [active]
  );

  return (
    <div className="relative w-full">
      {/* 배경 바 */}
      <div className="relative z-10 flex items-center justify-around gap-20 rounded-t-3xl rounded-b-none bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.25)]">
        {/* 왼쪽 탭: 기록 */}
        <button
          type="button"
          onClick={() => onChange?.("record")}
          className={`${tabBase} ${is("record") ? "text-white" : ""}`}
          aria-current={is("record") ? "page" : undefined}
        >
          <ArchiveIcon className={`h-5 w-5 ${tone.icon("record")}`} />
          <span className={`${labelBase} ${tone.text("record")}`}>기록</span>
        </button>

        {/* 오른쪽 탭: 마이페이지 */}
        <button
          type="button"
          onClick={() => onChange?.("mypage")}
          className={`${tabBase} ${is("mypage") ? "bg-white" : ""}`}
          aria-current={is("mypage") ? "page" : undefined}
        >
          <UserIcon className={`h-5 w-5 ${tone.icon("mypage")}`} />
          <span className={`${labelBase} ${tone.text("mypage")}`}>
            마이페이지
          </span>
        </button>
      </div>

      {/* 상단 볼록-노치(배경) */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 z-20 h-10 w-10 -translate-x-1/2 -translate-y-1/4 rounded-full bg-white "
      />

      {/* 가운데 플로팅 마이크 버튼 */}
      <button
        type="button"
        onClick={() => onChange?.("mic")}
        className={`group absolute left-1/2 top-0 z-30 grid h-16 w-16 -translate-x-1/2 -translate-y-1/4 place-items-center rounded-full
          bg-button-nav ring-8 ring-white transition shadow-[0_-10px_10px_rgba(0,0,0,0.25)]
          hover:scale-105 active:scale-95
          ${is("mic") ? "" : ""}`}
        aria-current={is("mic") ? "page" : undefined}
      >
        <div className="absolute inset-0 rounded-full bg-button-nav"></div>
        <MicIcon className="relative h-7 w-7 text-white z-10" />
        
        {/* 글로우 효과 - 버튼 뒤에 위치 */}
        <div 
          className="absolute inset-0 rounded-full -z-10"
          style={{
            background: 'radial-gradient(circle, rgb(108, 81, 199) 0%, transparent 70%)',
            filter: 'blur(8px)',
            transform: 'scale(1.5)'
          }}
        ></div>
      </button>
      {/* 마이크 버튼 아래 텍스트 */}
      <div className="absolute left-1/2 top-12 z-30 -translate-x-1/2">
        <span className={`${labelBase} ${tone.text("mic")} transition`}>
          녹음
        </span>
      </div>
    </div>
  );
}

/* --- 간단 SVG 아이콘 (의존성 없이 사용) --- */
function ArchiveIcon({ className = "" }) {
  return <FaBoxArchive className={className} />;
}
function MicIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Zm5-3a5 5 0 1 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.08A7 7 0 0 0 19 11a1 1 0 1 0-2 0Z" />
    </svg>
  );
}
function UserIcon({ className = "" }) {
  return (
    <IoPerson className={className}/>
  );
}
