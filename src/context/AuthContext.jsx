// src/context/AuthContext.jsx - JWT 기반 인증

import {
  createContext, useContext, useEffect, useMemo, useReducer, useCallback,
} from "react";
import api from "../api/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "ACCESS_TOKEN";

const initialState = { user: null, isAuth: false, checked: false };

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isAuth: true };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "SET_CHECKED":
      return { ...state, checked: action.payload };
    case "LOGOUT":
      return { ...state, user: null, isAuth: false };
    default:
      return state;
  }
}

function setToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common.Authorization;
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /** /auth/me로 사용자 정보 불러오기 */
  const fetchMe = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    dispatch({ type: "SET_USER", payload: data });
    return data;
  }, []);

  /** 로그인: 토큰 저장 → /auth/me 로드 */
  const login = useCallback(async (uId, uPwd) => {
    const { headers } = await api.post("/api/auth/signin", null, {
      params: { username: uId, password: uPwd }, // 필터가 request.getParameter로 읽음
    });

    const authHeader = headers?.authorization || headers?.Authorization;
    const token =
      authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (token) setToken(token);

    // 토큰을 올려둔 상태에서 사용자 정보 로드
    const me = await fetchMe();
    return me;
  }, [fetchMe]);

  /** 앱 시작 시: 저장된 토큰 복구 → /auth/me 시도 */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = getToken();
      if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

      try {
        if (token) {
          const me = await fetchMe();
          if (!mounted) return;
          if (me) dispatch({ type: "SET_USER", payload: me });
        } else {
          if (mounted) dispatch({ type: "LOGOUT" });
        }
      } catch {
        if (mounted) {
          clearToken();
          dispatch({ type: "LOGOUT" });
        }
      } finally {
        if (mounted) dispatch({ type: "SET_CHECKED", payload: true });
      }
    })();
    return () => (mounted = false);
  }, [fetchMe]);

  /** 로컬 사용자 정보 일부 업데이트(예: 테마 변경 반영) */
  const updateUserInfo = useCallback((updatedInfo) => {
    dispatch({ type: "UPDATE_USER", payload: updatedInfo });
  }, []);

  /** 로그아웃 */
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      clearToken();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  /** 인터셉터: 모든 요청에 토큰 보강 + 401 처리( /auth는 제외 ) */
  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      if (!config.headers.Authorization) {
        const t = getToken();
        if (t) config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    });

    const resId = api.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";
        if (status === 401 && !url.startsWith("/auth")) {
          clearToken();
          dispatch({ type: "LOGOUT" });
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, []);
    useEffect(() => {
  if (typeof document === "undefined") return;
  const t = state.user?.uTheme;
  if (t) document.documentElement.setAttribute("data-theme", t.toLowerCase());
}, [state.user?.uTheme]);

  const value = useMemo(
    () => ({ ...state, login, fetchMe, updateUserInfo, logout, dispatch }),
    [state, login, fetchMe, updateUserInfo, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}