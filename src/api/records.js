// 녹음/리스트 관련 API만 모아둔 모듈
import api from "./api";

export const RecordsAPI = {
  /** 레코드 리스트 이름들 가져오기: [{id, name}] */
  async getRecordNames(uId) {
    console.log("uId"+uId);
    const { data } = await api.get(`/records/${uId}/record-name`);
    return Array.isArray(data) ? data : [];
  },

  /** 특정 rlId의 레코드들(+버블) 조회 */
  async getRecordsByList(rlId, userId) {
    const { data } = await api.get(`/record-lists/${rlId}/records`, {
      params: { userId: userId ?? "" },
    });
    return Array.isArray(data) ? data : [];
  },

  /** 현재 세션 저장 (FormData) */
  async saveRecord(formData) {
    const { data } = await api.post("/records/save", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** (테스트) 서버로 텍스트 보내서 감정라벨 받기 */
  async sendTextForEmotion(payload) {
    const { data } = await api.post("/healthz", payload);
    return data;
  },
};
