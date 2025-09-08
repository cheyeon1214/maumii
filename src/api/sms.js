// SMS(휴대폰 인증) 관련 요청만 모아둔 모듈
import api from "./api"; // baseURL, withCredentials 세팅된 axios 인스턴스

export const SmsAPI = {
  // 인증 코드 전송
  sendCode(phone) {
    return api.post("/sms/send", { phone }).then((res) => res.data);
  },

  // 인증 코드 검증
  verifyCode({ phone, code }) {
    return api.post("/sms/verify", { phone, code }).then((res) => res.data);
  },
};