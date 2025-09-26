// src/components/RecordButton.jsx
import { useTheme } from "../hooks/useTheme";
import EMOTIONS from "../data/Emotion";
export default function RecordButton({
  role = "me",
  isRecording = false,
  activeRole = null,
  onClick,
  className = "",
  title = "",
}) {
  const { currentTheme } = useTheme();
  const isActive = isRecording && activeRole === role;

  const calmEmotion = EMOTIONS.find((e) => e.name === "차분");
  const iconSrc = calmEmotion?.image?.[currentTheme];

  const BORDER = {
    cloud: {
      me: { active: "border-cloud-mine", inactive: "border-cloud-mine" },
      partner: { active: "border-cloud-partner", inactive: "border-cloud-partner" },
    },
    bear: {
      me: { active: "border-bear-mine", inactive: "border-bear-mine" },
      partner: { active: "border-bear-partner", inactive: "border-bear-partner" },
    },
  };
  const borderClass =
    BORDER[currentTheme]?.[role]?.[isActive ? "active" : "inactive"] ??
    "border-gray-300";

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "relative cursor-pointer w-20 h-20 rounded-full bg-white border-4 shadow-xl flex items-center justify-center overflow-visible",
        borderClass,
        className,
      ].join(" ")}
    >
      {/* 🔥 녹음 중일 때 파동 링 */}
      {isActive && (
        <span className={[
        "absolute inset-0 rounded-full border-4 borderClass animate-pulseRing",
        borderClass,
      ].join(" ")}
        ></span>
      )}

      <span className="w-12 h-12 relative z-10">
        <img
          src={iconSrc}
          alt="차분"
          className="w-full h-full object-contain"
        />
      </span>
    </button>
  );
}