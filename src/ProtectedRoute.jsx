// // src/ProtectedRoute.jsx
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "./context/AuthContext";

// export default function ProtectedRoute() {
//   const { isAuth, checked } = useAuth();
//   if (!checked) return null; // 또는 <FullScreenSpinner />
//   return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
// }


import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute() {
  const { isAuth, checked } = useAuth();
  if (!checked) return null; // 검증 전에는 렌더 지연
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
