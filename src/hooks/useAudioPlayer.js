// src/hooks/useAudioPlayer.js
import { useEffect, useRef, useState } from "react";
import api from "../api/api";

export function useAudioPlayer() {
  const audioRef = useRef(null);

  const [activeRecId, setActiveRecId] = useState(null);
  const [progress, setProgress] = useState(0);         // 0 ~ 1
  const [playing, setPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0); // 재생 위치(ms)
  const [totalMs, setTotalMs] = useState(0);             // 전체 길이(ms)

  const objectUrlRef = useRef(null);

  // 재생 위치/진행률 RAF 업데이트
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    let raf;
    const tick = () => {
      if (a.duration > 0) {
        setProgress(a.currentTime / a.duration);
        setCurrentTimeMs(a.currentTime * 1000);
        setTotalMs(a.duration * 1000);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // play/pause 동기화
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  // 섹션(녹음) 재생
  const playSection = (section) => {
    const a = audioRef.current;
    if (!a || !section?.rVoice) return;

    const endpoint = `/records/${section.rId}/voice`; // 복호화 스트림 엔드포인트

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
    setCurrentTimeMs(0);
    setTotalMs(0);

    api
      .get(endpoint, { responseType: "blob" })
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

  return {
    audioRef,
    // 상태
    activeRecId,
    playing,
    progress,
    currentTimeMs,
    totalMs,
    // 제어
    playSection,
    getProgressOf,
    seek,
  };
}