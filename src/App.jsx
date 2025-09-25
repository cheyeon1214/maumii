// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthBootstrap from "./AuthBootstrap";
import ProtectedRoute from "./ProtectedRoute";

import Intro from "./pages/Intro.jsx";
import Register from "./pages/Register.jsx";
import RegisterDetail from "./pages/RegisterDetail.jsx";
import Login from "./pages/Login.jsx";
import Mypage from "./pages/Mypage.jsx";
import MypageEdit from "./pages/MypageEdit.jsx";
import Protector from "./pages/Protector.jsx";
import MypageTheme from "./pages/MypageTheme.jsx";
import Record from "./pages/Record.jsx";
import RecordList from "./pages/RecordList.jsx";
import RecordDetail from "./pages/RecordDetail.jsx";
import Emotion from "./pages/EmotionCard.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  return (
    <AuthProvider>
      <AuthBootstrap>
        <Routes>
          {/* ✅ 공개 + 보호 라우트를 모두 Layout으로 감싼다 */}
          <Route element={<Layout />}>
            {/* 공개 라우트 (네비는 Layout 내부 hideNav 로직으로 숨김) */}
            <Route path="/" element={<Intro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/detail" element={<RegisterDetail />} />

            {/* 보호 라우트 (로그인 필수) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/mypage" element={<Mypage />} />
              <Route path="/mypage/edit" element={<MypageEdit />} />
              <Route path="/mypage/protector" element={<Protector />} />
              <Route path="/mypage/theme" element={<MypageTheme />} />

              <Route path="/record" element={<Record />} />
              <Route path="/record-list" element={<RecordList />} />
              <Route path="/record-list/:rlId" element={<RecordDetail />} />
              <Route path="/emotion" element={<Emotion />} />

              <Route path="/oauth/success" element={<div>로그인 성공</div>} />
              <Route path="/oauth/fail" element={<div>로그인 실패</div>} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="p-6">Not Found</div>} />
        </Routes>
      </AuthBootstrap>
    </AuthProvider>
  );
}
