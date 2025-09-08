import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from 'react'; 
import maeumiText from "../assets/images/logo.svg";
import maumiMascot from "../assets/images/maumi.svg";

export default function Intro() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center">
      {/* 상단 설명 텍스트 - 반응형 */}
      <motion.div
        className="text-center mb-4 px-4 z-10
        text-[#5B5758] text-base font-[Inter] font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        오가는 대화 속에 감정을 알아보는
      </motion.div>

      {/* 마음이 텍스트 - 반응형 */}
      <motion.div
        className="text-center mb-2 px-4 z-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          type: "spring",
          stiffness: 100,
        }}

      >
        <img src={maeumiText} alt="마음이" />
      </motion.div>

      {/* 마스코트 이미지 - 반응형 */}
      <motion.div
        className="flex items-center justify-center gap-20 z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <motion.img
          src={maumiMascot}
          alt="maumi"
          className="w-72 h-72 max-w-[80vw] max-h-[40vh] object-contain"
          animate={{
            y: [-5, 5, -5],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* 하단 로그인/회원가입 - 반응형 */}
      <motion.div
        className="flex items-center gap-2 mb-8 px-4 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <Link to="/register">
          <motion.div
            className="font-medium cursor-pointer
            text-[#979092] text-xs font-[Inter]"
            whileHover={{
              scale: 1.1,
              color: "#A960B0",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            회원가입
          </motion.div>
        </Link>

        <div
          className="font-medium
          text-[#979092] text-xs font-[Inter]"
        >
          |
        </div>
        
        <Link to="/login">
          <motion.div
            className="font-medium cursor-pointer
            text-[#979092] text-xs font-[Inter]"
            whileHover={{
              scale: 1.1,
              color: "#A960B0",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            로그인
          </motion.div>
        </Link>
      </motion.div>

      {/* 배경 원 1 - 우 상단 */}
      <motion.div
        className="absolute -top-8 md:-left-30 -left-20 
        w-60 h-60 md:w-80 md:h-80 
        rounded-full blur-[30px] z-0"
        style={{
          background: "rgba(247, 188, 205, 0.7)",
        }}
        animate={{
          x: [0, 30, 45, 25, 0],
          y: [0, 20, 35, 25, 0],
          scale: [1, 1.3, 0.7, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 배경 원 2 - 우중단 */}
      <motion.div
        className="absolute md:top-44 top-[100px] md:left-32 left-28 
        w-36 h-36 md:w-44 md:h-44 
        rounded-full blur-[30px] z-0"
        style={{
          background: "rgba(225, 149, 230, 0.4)",
        }}
        animate={{
          x: [0, 60, 10, 0],
          y: [0, 30, 50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 배경 원 3 - 하좌측 */}
      <motion.div
        className="absolute md:bottom-8 -bottom-4 md:-right-4 -right-4
        w-52 h-52 md:w-52 md:h-52 rounded-full blur-[40px] z-0"
        style={{
          background: "rgba(252, 131, 88, 0.5)",
        }}
        animate={{
          x: [0, 10, 20, 10, 35, 0],
          y: [0, 20, 35, 15, 25, 0],
          scale: [1, 1.1, 0.95, 1.05, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 배경 원 4 - 하좌측 작은 원 */}
      <motion.div
        className="absolute md:bottom-48 bottom-32 
        md:right-32 right-32 w-32 h-32 
        md:w-24 md:h-24 rounded-full blur-[20px] z-[1]"
        style={{
          background: "rgba(253, 232, 185, 0.6)",
        }}
        animate={{
          x: [0, 10, 0],
          y: [0, 35, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
