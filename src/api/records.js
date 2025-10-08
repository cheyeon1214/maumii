// src/api/records.js
import api from "./api.js";

export const RecordsAPI = {
  /** 레코드 리스트 이름들 가져오기: [{id, name}] */
  async getRecordNames(uId) {
    console.log("uId:", uId);
    const res = await api.get(`/records/${uId}/record-name`);
    const data = res.data;
    return Array.isArray(data) ? data : [];
  },

  /** 특정 rlId의 레코드들(+버블) 조회 */
  async getRecordsByList(rlId, userId) {
    const res = await api.get(`/records/${rlId}`, {
      params: { userId: userId || "" },
    });
    const data = res.data;
    return Array.isArray(data) ? data : [];
  },

  /** 현재 세션 저장 (FormData) */
  async saveRecord(formData) {
    const token = localStorage.getItem("ACCESS_TOKEN");
    const res = await api.post("/records/save", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /** (테스트) 서버로 텍스트 보내서 감정라벨 받기 */
  async sendTextForEmotion(payload) {
    const res = await api.post("/healthz", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },
};