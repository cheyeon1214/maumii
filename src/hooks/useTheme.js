import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getThemeConfig } from "../utils/themeUtils";

export function useTheme() {
  const { user } = useAuth();
  const [domTheme, setDomTheme] = useState(
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme")
      : null
  );

  // 1) user 값이 바뀌면 DOM에도 반영 (단방향 동기화)
useEffect(() => {
  if (!user?.uTheme) return;
  const wanted = user.uTheme.toLowerCase();
  document.documentElement.setAttribute("data-theme", wanted);
  setDomTheme(wanted); // domTheme 상태도 업데이트
}, [user?.uTheme]);

// 2) DOM 직접 변경 감시 (선택사항: 외부 조작 대비)
useEffect(() => {
  if (typeof MutationObserver === "undefined") return;
  const target = document.documentElement;
  const obs = new MutationObserver(() => {
    setDomTheme(target.getAttribute("data-theme"));
  });
  obs.observe(target, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}, []);

  // 우선순위: user > DOM > fallback
  const currentTheme = (user?.uTheme?.toLowerCase() || domTheme || "cloud");
  const themeConfig = getThemeConfig(currentTheme);

  return {
    currentTheme,
    themeConfig,
    isCloud: currentTheme === "cloud",
    isBear: currentTheme === "bear",
  };
}