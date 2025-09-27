// src/hooks/useExposure.js
import { useAuth } from "../context/AuthContext";

export function useExposure() {
  const { user } = useAuth();
  // uExposure === true -> 비속어 가리기 ON
  const exposureOn = !!user?.uExposure;
  return { exposureOn };
}