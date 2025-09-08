// Bubble.jsx
import React from "react";
import { useTheme } from "../hooks/useTheme";
import { getEmotionImg } from "../utils/emotion";
import { THEMES, getBubbleBg } from "../utils/themeUtils"; // ⬅️ getBubbleBg 가져오기

function Bubble({ bId, me = false, text = "", sub, isActive = false, emotion }) {
  const { currentTheme } = useTheme();

  const avatar =
    getEmotionImg(currentTheme, emotion) ||
    THEMES[currentTheme]?.profileImage ||
    THEMES.cloud.profileImage;

  // ⬅️ 여기서 테마별 말풍선 배경색 뽑기
  const bubbleBg = getBubbleBg(currentTheme, me);

  return (
    <div className="mt-4 flex w-full">
      {/* 상대(왼쪽) */}
      {!me && (
        <div className="ml-0 mr-auto flex items-end gap-3">
          <img
            src={avatar}
            alt={emotion || "avatar"}
            className="h-16 w-16 shrink-0 object-cover"
            draggable={false}
          />

          <div className="max-w-[70%] text-left">
            <div
              className={[
                "rounded-2xl px-4 py-3 whitespace-pre-wrap break-words leading-6 text-[14px] shadow",
                "text-slate-800 rounded-bl-md",
                isActive
                  ? "shadow-[0_0_14px_rgba(126,104,255,0.6)] ring-1 ring-purple-400/40"
                  : "",
              ].join(" ")}
              // ⬅️ 배경색을 토큰으로 주입
              style={{ backgroundColor: bubbleBg }}
            >
              {text}
            </div>
            {sub && (
              <div className="mt-1 text-xs text-slate-400 text-left">{sub}</div>
            )}
          </div>
        </div>
      )}

      {/* 나(오른쪽) */}
      {me && (
        <div className="ml-auto mr-0 flex justify-end gap-3">
          <div className="max-w-[70%]">
            <div
              className={[
                "rounded-2xl px-4 py-3 whitespace-pre-wrap break-words leading-6 text-[14px] shadow",
                "text-slate-800 rounded-br-md",
                isActive
                  ? "shadow-[0_0_14px_rgba(126,104,255,0.6)] ring-1 ring-purple-400/40"
                  : "",
              ].join(" ")}
              // ⬅️ 배경색을 토큰으로 주입
              style={{ backgroundColor: bubbleBg }}
            >
              {text}
            </div>
            {sub && (
              <div className="mt-1 text-xs text-slate-400 text-right">
                {sub}
              </div>
            )}
          </div>

          <img
            src={avatar}
            alt={emotion || "avatar"}
            className="h-16 w-16 shrink-0 object-cover"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}

export default Bubble;
