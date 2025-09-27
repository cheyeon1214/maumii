// src/components/Layout.jsx
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import Navigation from "./Navigation.jsx";
import { useApplyTheme } from "../../hooks/useApplyTheme";

export default function Layout() {
  useApplyTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const keyToPath = {
    record: "/record-list",
    mic: "/record",
    mypage: "/mypage",
  };

  let active = "record";
  if (location.pathname.startsWith("/mypage")) active = "mypage";
  else if (location.pathname.startsWith("/record-list")) active = "record";
  else if (location.pathname.startsWith("/record")) active = "mic";

  const hideNav = ["/login", "/register", "/register/detail", "/"].includes(location.pathname);

  return (
    <div className="h-full md:grid md:place-items-center md:bg-slate-200">
      {/* 폰 프레임 (md 이상에서만 적용) */}
      <div
        className="
          fixed inset-0 w-full h-[100svh] bg-white
          md:relative md:h-[780px] md:max-w-[390px]
          flex flex-col overflow-hidden
          md:rounded-[32px] md:shadow-2xl md:border md:border-slate-300
        "
      >
        {/* 데스크탑에서만 보이는 노치 */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-300/30 rounded-b-2xl mt-1 z-20" />

        <main className="flex-1 min-h-0">
          <Outlet />
        </main>

        {!hideNav && (
          <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(0px,env(safe-area-inset-bottom))] backdrop-blur border-slate-200">
            <Navigation active={active} onChange={(key) => navigate(keyToPath[key])} />
          </div>
        )}
      </div>
    </div>
  );
}