// src/components/SaveDialog.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SaveModal({ open, onClose, lists, onConfirm }) {
  const [mode, setMode] = useState("select");   // 'select' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open) { setMode("select"); setSelectedId(null); setNewName(""); }
  }, [open]);

  useEffect(() => {
    if (mode === "select" && !selectedId && Array.isArray(lists) && lists.length > 0) {
      setSelectedId(String(lists[0].rlId));
    }
  }, [lists, mode, selectedId]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* 패널 — ConfirmModal과 동일한 틀 */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-xl shadow-lg w-80 text-center overflow-hidden"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h2 className="text-400 font-bold pt-6 mb-3">녹음 파일 저장</h2>

        {/* 설명 */}
        <p className="text-gray-600 text-sm mb-4">기록함을 선택하세요</p>

        {/* 본문(입력 영역) */}
        <div className="px-5 pb-2">
          {mode === "select" ? (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <select
                  className="w-full h-10 border rounded-lg px-3 bg-gray-50 appearance-none pr-10"
                  value={selectedId ?? ""}
                  onChange={(e) => setSelectedId(e.target.value || null)}
                >
                  <option value="">새 기록함 만들기…</option>
                  {lists.map((it) => (
                    <option key={it.rlId} value={it.rlId}>
                      {it.rlName}
                    </option>
                  ))}
                </select>

                {/* 화살표 아이콘 */}
                <span className=" absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </span>
              </div>
              <button
                className="w-20 h-10 text-sm text-center border rounded-lg"
                onClick={() => setMode("new")}
              >
                추가
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                className="w-[188px] h-10 border rounded-lg px-3 bg-gray-50"

                placeholder="새 기록함 01"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                className="w-20 h-10 text-sm text-center border rounded-lg whitespace-nowrap"

                onClick={() => setMode("select")}
              >
                목록
              </button>
            </div>
          )}
        </div>

        {/* 구분선 + 버튼(ConfirmModal과 동일) */}
        <hr className="mt-4 border-gray-200" />
        <div className="flex divide-x divide-gray-300">
          <button
            onClick={onClose}
            className="w-1/2 py-4 text-400 font-semibold"
          >
            아니오
          </button>
          <button
            onClick={() => {
              const payload =
                mode === "select"
                  ? { recordListId: selectedId ? Number(selectedId) : null, recordListTitle: null }
                  : { recordListId: null, recordListTitle: newName || null };
              onConfirm(payload);
            }}
            className="w-1/2 py-4 text-400 font-semibold"
          >
            예
          </button>
        </div>
      </motion.div>
    </div>
  );
}