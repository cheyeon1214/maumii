
import React from "react";
import { FaPlay, FaPause } from "react-icons/fa";

function SectionHeader({
  dateLabel,
  duration,           // "15초" 같은 라벨
  progress = 0,       // 0 ~ 1
  onPlay = () => {},
  onSeek = null,      // (ratio: 0~1) => void
  isActive = false,   // ✅ 추가
  isPlaying = false,  // ✅ 추가
}) {
  const pct = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;

  return (
    <div className="mt-6 mb-3">
      <div className="flex items-center gap-3 px-3">
        <div className="text-slate-700 font-semibold">{dateLabel}</div>

        {/* ▶️/⏸ 토글 */}
        <button
          onClick={onPlay}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-button-record text-white shadow"
        >
          {isActive && isPlaying ? (
            <FaPause className="w-4 h-4 block m-auto" />
          ) : (
            <FaPlay className="w-4 h-4 block ml-1" />
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 px-1">
        <input
          type="range"
          min="0"
          max="1000"
          value={Math.round(pct * 1000)}
          onChange={(e) => {
            if (!onSeek) return;
            const v = Number(e.target.value) / 1000;
            onSeek(v);
          }}
          className="w-[280px] accent-button-record"
        />
        <div className="text-slate-500 text-xs">{duration}</div>
      </div>
    </div>
  );
}

export default SectionHeader;