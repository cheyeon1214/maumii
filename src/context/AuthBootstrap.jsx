import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthBootstrap({ children }) {
  const { fetchMe, dispatch } = useAuth();

  useEffect(() => {
    let alive = false;
    (async () => {
      try {
        if (!alive) return;
        await fetchMe();
      } catch {
        if (alive) dispatch({ type: "SET_USER", payload: null }); // 비로그인
      } finally {
        if (alive) dispatch({ type: "SET_CHECKED", payload: true }); // 검증 완료
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchMe, dispatch]);

  return <>{children}</>;
}
