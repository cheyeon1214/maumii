// useRecords.js
import { useEffect, useState } from "react";
import { fmtDateLabel, fmtDurationKorean, fmtStartLabel, toMsFromLocalTime } from "../utils/time";
import { RecordsAPI } from "../api/records";

const absUrl = (u) => (u?.startsWith("/") ? `http://localhost:9000${u}` : (u || ""));

export function useRecords(rlId, userId) {
  const [title, setTitle] = useState("대화 기록");
  const [sections, setSections] = useState([]); // [{id, rId, rVoice, header, talks}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await RecordsAPI.getRecordsByList(rlId, userId);
        if (Array.isArray(data) && data.length > 0 && data[0].rlName) {
          setTitle(data[0].rlName || "대화 기록");
        }

        const mapped = (Array.isArray(data) ? data : []).map((rec) => {
          const totalMs =
            typeof rec.rLength === "string"
              ? toMsFromLocalTime(rec.rLength)
              : (rec.totalMs ?? 0);

          let cursorMs = 0;
          const talks = (rec.bubbles || []).map((b, idx) => {
            const lenMs =
              b?.durationMs ??
              (typeof b?.bLength === "string" ? toMsFromLocalTime(b.bLength) : 0);

            const talk = {
              id: idx + 1,
              me: (b?.bTalker || "").toLowerCase() === "me",
              text: b?.bText || "",
              sub: fmtStartLabel(cursorMs),
              startMs: cursorMs,
              endMs: cursorMs + Math.max(0, lenMs),
              emotion: b?.bEmotion || ""
            };
            cursorMs += Math.max(0, lenMs);
            return talk;
          });

        
          return {
            id: `rec-${rec.rId}`,
            rId: rec.rId,
            rVoice: absUrl(rec.rVoice || ""),
            header: {
              dateLabel: fmtDateLabel(rec.rCreatedAt),
              duration: fmtDurationKorean(totalMs), // 기존 라벨 유지(백업용)
              totalMs,                              // ⬅️ 추가: 숫자(ms)
            },
            talks,
          };
        });

        setSections(mapped);
      } catch (e) {
        setError(String(e?.message || e));
        setSections([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [rlId, userId]);

  return { title, setTitle, sections, loading, error };
}