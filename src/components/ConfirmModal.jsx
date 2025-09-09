// src/components/Modal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({
  isOpen,
  mode = "confirm", // "confirm" | "alert"
  title,
  description,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* dim */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0 }}
          />

          {/* card */}
          <motion.div
            className="relative bg-white rounded-xl shadow-lg w-80 text-center overflow-hidden"
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 제목 */}
            {title && <h2 className="text-400 font-bold pt-6 mb-3">{title}</h2>}

            {/* 설명 */}
            {description && (
              <p className="text-gray-600 text-sm mb-4">{description}</p>
            )}

            {/* input/select 등 삽입 */}
            {children && <div className="mb-6">{children}</div>}

            <hr />

            {/* 버튼 영역 (디자인 그대로) */}
            {mode === "confirm" ? (
              <div className="flex divide-x divide-gray-300 justify-between">
                <button
                  onClick={onCancel}
                  className="w-1/2 py-4 text-400 font-semibold active:bg-gray-100 active:scale-95 transition"
                >
                  아니오
                </button>
                <button
                  onClick={onConfirm}
                  className="w-1/2 py-4 text-400 font-semibold active:bg-gray-100 active:scale-95 transition"
                >
                  예
                </button>
              </div>
            ) : (
              <div className="flex">
                <button
                  onClick={onCancel}
                  className="w-full py-4 text-400 font-semibold active:bg-gray-100 active:scale-95 transition"
                >
                  닫기
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}