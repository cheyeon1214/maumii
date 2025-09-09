import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import maumiiCalm from "../assets/images/maumi.svg";

export default function AngryModal({ open, onClose, onGuide }) {
  // 모달 열리면 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 마음이 입장(한번) + 착지 후 미세한 플로팅(무한)
  const enterVariants = {
    hidden: { opacity: 0, y: -100, scale: 0.6, rotate: -8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        type: "spring",
        bounce: 0.35,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          {/* 배경 오버레이 (그라데이션 + 블러) */}
          <motion.div
            className="absolute inset-0 backdrop-blur-[6px]"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, transparent 45%), rgba(0,0,0,.25)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

         {/* 카드 */}
<motion.div
  className="relative z-[71] mx-5 max-w-[480px] 
             rounded-2xl border border-rose-100/60 shadow-xl 
             bg-white/90 overflow-hidden
             flex flex-col items-center justify-center
             h-[400px]"   // 🔥 높이 늘림
  initial={{ opacity: 0, scale: 0.92, y: 14 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: 10 }}
  transition={{ type: "spring", stiffness: 120, damping: 14 }}
>
  {/* 상단: 마음이 */}
  <div className="mb-4 flex items-center justify-center">
    <motion.img
      src={maumiiCalm}
      alt="maumi"
      variants={enterVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-40 h-40"
      whileInView={{ y: [0, -4, 0], rotate: [0, 1.5, 0] }}
      viewport={{ once: true }}
      transition={{
        delay: 0.85,
        y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
      }}
    />
  </div>

  {/* 내용 */}
  <div className="px-5 sm:px-6 text-center">  {/* 🔥 text-center */}
    <div className="text-primary font-semibold text-base sm:text-lg mb-2">
      여기서 잠깐!
    </div>

    <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#5B5758]">
      감정이 조금 격해졌어요.
      <br />
      잠깐 호흡하고 대화를 천천히 이어가볼까요?
    </p>

    {/* 버튼들 */}
    <div className="mt-6 flex gap-3 justify-center">
      <button
        className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition"
        onClick={onClose}
      >
        괜찮아요
      </button>
    </div>
  </div>
</motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}