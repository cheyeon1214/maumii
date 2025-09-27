export const parseLocalDateTime = (s) => {
  if (!s) return null;
  if (s instanceof Date) return isNaN(s) ? null : s;
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(s);
  if (m) {
    const [, Y, M, D, h, mi, se = "0", ms = "0"] = m;
    return new Date(+Y, +M - 1, +D, +h, +mi, +se, +`${ms}`.padEnd(3, "0"));
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

export const fmtDateLabel = (s) => {
  const d = parseLocalDateTime(s);
  if (!d) return "-";
  const dow = ["일","월","화","수","목","금","토"][d.getDay()];
  const h = d.getHours();
  const ampm = h < 12 ? "오전" : "오후";
  const hh = (h % 12) || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth()+1}.${d.getDate()} ${dow} ${ampm} ${hh}:${mm}`;
};

export const toMsFromLocalTime = (t) => {
  if (!t && t !== 0) return 0;
  if (typeof t === "number") return t;
  const m = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/.exec(t);
  if (!m) return 0;
  const [, hh, mm, ss, ms = "0"] = m;
  return ((+hh)*3600 + (+mm)*60 + (+ss))*1000 + +`${ms}`.padEnd(3, "0");
};

export const fmtDurationKorean = (ms) => {
  const sec = Math.floor((ms||0)/1000);
  const h = Math.floor(sec/3600);
  const m = Math.floor((sec%3600)/60);
  const s = sec%60;
  if (h) return `${h}시간 ${m}분 ${s}초`;
  if (m) return `${m}분 ${s}초`;
  return `${s}초`;
};

export const fmtStartLabel = (ms) => {
  const sec = Math.floor(ms/1000);
  const m = Math.floor(sec/60);
  const s = sec % 60;
  return m >= 1 ? `${m}분 ${s}초` : `${(ms/1000).toFixed(1)}초`;
};

export const fmtClock = (ms) => {
  const sec = Math.max(0, Math.floor((ms || 0) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s}초`;
  const pad2 = (n) => String(n).padStart(2, "0");
  return `${pad2(m)}분 ${pad2(s)}초`;
};