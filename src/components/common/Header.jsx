import React from "react";

/**
 * Header 컴포넌트
 * @param {string} title - 가운데/왼쪽에 보여줄 제목
 * @param {ReactNode} rightSlot - 오른쪽에 올 커스텀 액션 영역(선택 버튼 등)
 * @param {boolean} center - 타이틀을 가운데 정렬할지 여부 (기본: false = 좌측 정렬)
 */
function Header({
  title,
  rightSlot = null,
  center = false,
  shadow = false,
  fix = false,
}) {
  return (
    <div
      className={`w-full pt-10 pb-5 pr-10 pl-10 bg-white rounded-b-[40px] flex items-center px-5
        ${center ? "justify-center" : "justify-between"} 
        ${shadow ? "" : "shadow-md"}
        ${fix ? "" : "sticky top-0 z-20"}`}
    >
      <h1 className="font-semibold text-lg">{title}</h1>
      {!center && rightSlot}
    </div>
  );
}

export default Header;
