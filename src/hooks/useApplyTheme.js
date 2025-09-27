import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export function useApplyTheme() {
  const { user } = useAuth();
  useEffect(() => {
    const theme = user?.uTheme || "cloud";
    document.documentElement.setAttribute("data-theme", theme);
  }, [user?.uTheme]);
}
