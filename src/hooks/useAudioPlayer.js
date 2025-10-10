import { useEffect, useRef, useState } from "react";
import api from "../api/api";
export function useAudioPlayer() {
  const audioRef = useRef(null);
  const [activeRecId, setActiveRecId] = useState(null);
  const [progress, setProgress] = useState(0);     // 0~1
  const [playing, setPlaying] = useState(false);
  const objectUrlRef = useRef(null);

  // RAF로 진행률 업데이트
  useEffect(()=>{
    const a = audioRef.current;
    if (!a) return;
    let raf;
    const tick = () => {
      if (a.duration > 0) setProgress(a.currentTime / a.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // play/pause 이벤트로 상태 동기화
  useEffect(()=>{
    const a = audioRef.current;
    if (!a) return;
    const onPlay = ()=> setPlaying(true);
    const onPause = ()=> setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  const playSection = (section) => {
    const a = audioRef.current;
    if (!a || !section?.rVoice) return;
    // const src = section.rVoice;
    // '/voices/xxx.wav' 같은 경로면 절대경로로 바꿔줌
  //  const src = section.rVoice.startsWith('http')
  //    ? section.rVoice
  //    : `${location.origin}${section.rVoice}`;
  //   if (a.src === src) {
  //     a.paused ? a.play() : a.pause();
  //   } else {
  //     a.src = src;
  //     a.currentTime = 0;
  //     setActiveRecId(section.rId);
  //     // a.play();
  //     a.load();
  //     a.play().catch((err) => {
  //      console.warn('[audio] play failed:', err);
  //    });
     // 새로: 복호화 스트리밍 엔드포인트에서 WAV Blob 받아서 재생
   const endpoint = `/records/${section.rId}/voice`; // 백엔드 컨트롤러에 추가한 복호화 스트림

  // 같은 섹션이면 토글만
  if (section.rId === activeRecId && a.src) {
     a.paused ? a.play() : a.pause();
     return;
   }

   // 이전 blob URL 정리
   if (objectUrlRef.current) {
     URL.revokeObjectURL(objectUrlRef.current);
     objectUrlRef.current = null;
   }

  setActiveRecId(section.rId);
   a.currentTime = 0;

   // axios 인스턴스(api)로 Blob 받기 (Authorization 포함)
   api.get(endpoint, { responseType: "blob" })
     .then((res) => {
       const blob = new Blob([res.data], { type: "audio/wav" });
       const url = URL.createObjectURL(blob);
       objectUrlRef.current = url;
       a.src = url;
       return a.play();
     })
     .catch((err) => {
       console.warn("[audio] load/play failed:", err);
     });
    
  };

  const getProgressOf = (sec) => (sec.rId === activeRecId ? progress : 0);
  const seek = (sec, ratio) => {
    const a = audioRef.current;
    if (!a || sec.rId !== activeRecId || !Number.isFinite(a.duration)) return;
    a.currentTime = Math.max(0, Math.min(1, ratio)) * a.duration;
  };

  return { audioRef, activeRecId, playing, playSection, getProgressOf, seek };
}