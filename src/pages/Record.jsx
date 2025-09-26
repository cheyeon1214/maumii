import { useEffect, useRef, useState } from "react";
import { FaBook } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import HelpScreen from "./HelpScreen";
import EmotionCard from "./EmotionCard";
import SaveDialog from "../components/SaveModal";
import { RecordsAPI } from "../api/records.js";
import { getEmotionImg, defaultHeroByTheme } from "../utils/emotion";
import { useTheme } from "../hooks/useTheme";
import RecordButton from "../components/RecordButton";
import { useAuth } from "../context/AuthContext.jsx";
import { useExposure } from "../useExposure.js";
import { maskDotsToStars } from "../utils/maskDisplay";
import LoadingSpinner from "../components/Loading";
import AngryModal from "../components/AngryModal";
import ConfirmModal from "../components/ConfirmModal";
import { AnimatePresence, motion } from "framer-motion";
import EMOTIONS from "../data/Emotion";

const debugForm = async (form) => {
  // ⚠️ 훅 사용 금지(컴포넌트 외부)
  const blob = form.get("record"); // Blob(application/json)
  console.log("record blob:", blob);

  if (blob) {
    const txt = await blob.text(); // Blob → 문자열
    console.log("record JSON =>", txt);

    try {
      console.log("record parsed =>", JSON.parse(txt));
    } catch (e) {
      console.warn("JSON parse fail:", e);
    }
  }
};

export default function Record() {
  const utterRawRef = useRef({ final: "", partial: "" });
  const { exposureOn } = useExposure();
  const { user } = useAuth();
  const userId = user?.uId;
  const { currentTheme } = useTheme(); // ✅ 컴포넌트 내부에서 훅 호출

  const [sessionBubbles, setSessionBubbles] = useState([]); // ✅ 세션 버퍼
  const [heroId, setHeroId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);
  const commitLockRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [role, setRole] = useState(null);
  const roleRef = useRef(null);
  const [recordClose, setRecordClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emotion, setEmotion] = useState("calm");
  const [showSave, setShowSave] = useState(false);
  const [recordLists, setRecordLists] = useState([]);
  const [angryStreak, setAngryStreak] = useState(0);
  const [showAngryBanner, setShowAngryBanner] = useState(false);

  const [partialText, setPartialText] = useState("");
  const [chat, setChat] = useState([]); // 화면에는 항상 최신 1개만 보여줌
  const [composing, setComposing] = useState({
    active: false,
    who: null,
    text: "",
  });

  const hasRecording = sessionBubbles.length > 0;

  const wsRef = useRef(null);
  const mediaRecRef = useRef(null);
  const streamRef = useRef(null);
  const listEndRef = useRef(null);

  const currentChunksRef = useRef([]); // ✅ 이번 발화의 오디오 청크들
  const utterStartRef = useRef(null); // ✅ 발화 시작시간

  // 노출 설정에 따라 WS URL 생성
// 예: Record.jsx
const buildWsUrl = () => {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const params = new URLSearchParams({
    encoding: "OGG_OPUS",
    sample_rate: "16000",
    use_itn: "true",
    model_name: "sommers_ko",
    domain: "CALL",
    use_profanity_filter: exposureOn ? "false" : "true",
     use_disfluency: "true",
    use_punctuation: "true",
  });
  return `${proto}://${location.host}/ws/stt?${params.toString()}`;
};

  // 기존 상수 대신 함수 호출 결과 사용
  const WS_URL = buildWsUrl();

  const BUBBLE = {
    cloud: {
      me: "bg-cloud-mine text-text-400 rounded-br-md",
      partner: "bg-cloud-partner text-text-400 rounded-bl-md",
    },
    bear: {
      me: "bg-bear-mine text-text-400 rounded-br-md",
      partner: "bg-bear-partner text-text-400 rounded-bl-md",
    },
  };

  const getBubbleClass = (who) =>
    (who === "me"
      ? BUBBLE[currentTheme]?.me
      : BUBBLE[currentTheme]?.partner) ??
    "bg-gray-200 text-text-400";

  useEffect(() => {
    if (!showSave) return;
    (async () => {
      try {
        const data = await RecordsAPI.getRecordNames(userId);
        setRecordLists(Array.isArray(data) ? data : []);
      } catch {
        setRecordLists([]);
      }
    })();
  }, [showSave]);

  const scrollToBottom = () =>
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  const HERO_IMG_CLASS = "w-36 h-36";
  const isAngry = (em) => {
    const v = String(em || "").toLowerCase();
    // 백엔드 변형 라벨들 대비 + 접두어 방지
    return (
      ["angry", "disgust"].includes(v) ||
      v.startsWith("ang")
    );
  };

  const pickMime = () => {
    const c = [
      "audio/ogg;codecs=opus",
    "audio/webm;codecs=opus",
    "audio/webm",
    // "audio/mp4",   // Safari
    // "audio/aac" 
    ];
    for (const m of c)
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
    return "";
  };

  const parseStt = (raw) => {
    if (typeof raw !== "string") return null;
    try {
      const msg = JSON.parse(raw);
      const alt = Array.isArray(msg.alternatives) ? msg.alternatives[0] : null;
      const text = (
        alt?.transcript ||
        alt?.text ||
        msg.transcript ||
        msg.text ||
        ""
      ).trim();
      const isFinal = msg.final === true || msg.type === "final";
      const isPartial = msg.type === "partial" || (!isFinal && !!text);
      return { isFinal, isPartial, text };
    } catch {
      return null;
    }
  };

  /** ---------- WebSocket ---------- */
  const connectWS = () =>
    new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        setConnected(true);
        return resolve();
      }
      const ws = new WebSocket(WS_URL);
      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        setConnected(true);
        wsRef.current = ws;
        resolve();
      };
      ws.onmessage = (e) => {
        const parsed = parseStt(e.data);
        if (!parsed) return;

        if (parsed.isFinal && parsed.text) {
          utterRawRef.current.final =
            (utterRawRef.current.final
              ? utterRawRef.current.final + " "
              : "") + parsed.text;
          utterRawRef.current.partial = ""; // final 났으니 partial 비움

          // UI 노출은 별표
          const uiText = exposureOn ? maskDotsToStars(parsed.text) : parsed.text;

          setComposing((prev) => {
            if (!prev.active) return prev;
            const merged = (prev.text ? prev.text + " " : "") + uiText;
            return { ...prev, text: merged.trim() };
          });
          setPartialText("");
          scrollToBottom();
          return;
        }
        if (parsed.isPartial && parsed.text) {
          // 원문 partial 저장
          utterRawRef.current.partial = parsed.text;
          // UI는 별표
          setPartialText(exposureOn ? maskDotsToStars(parsed.text) : parsed.text);
          return;
        }
      };
      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
      };
      ws.onerror = (err) => {
        console.error("[WS] error", err);
        reject(err);
      };
    });

  const disconnectWS = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "user-toggle");
      } catch { }
      wsRef.current = null;
    }
    setConnected(false);
  };
  const ensureMicSupport = () => {
  if (!window.isSecureContext) {
    throw new Error("INSECURE_CONTEXT"); // https 필요
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    throw new Error("MEDIA_UNAVAILABLE"); // 브라우저/권한 문제
  }
};

  /** ---------- Recording ---------- */
  const startRecording = async (who) => {
    try {
    ensureMicSupport();
    // ... 기존 로직
  
    // 이번 발화 준비
    currentChunksRef.current = [];
    utterStartRef.current = Date.now(); // ✅ 시작시간
    utterRawRef.current = { final: "", partial: "" };
    setChat([]); // 이전 발화 제거
    setHeroId(null);
    setComposing({ active: true, who, text: "" });
    setPartialText("");
    commitLockRef.current = false;

    roleRef.current = who;
    setRole(who);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      await connectWS();
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;

    const mime = pickMime();
    if (!mime) {
      alert("브라우저가 OGG/WEBM OPUS 녹음을 지원하지 않습니다.");
      return;
    }

    const rec = new MediaRecorder(stream, {
      mimeType: mime,
      audioBitsPerSecond: 64000,
    });
    mediaRecRef.current = rec;

    rec.ondataavailable = async (ev) => {
      if (ev.data && ev.data.size > 0) currentChunksRef.current.push(ev.data); // ✅ 오디오 누적
      if (!ev.data || ev.data.size === 0) return;
      const buf = await ev.data.arrayBuffer();
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(buf);
    };
    rec.onerror = (e) => console.error("MediaRecorder error", e);

    rec.start(150);
    setIsRecording(true);
    } catch (e) {
    if (e.message === "INSECURE_CONTEXT") {
      alert("마이크 사용을 위해 https 로 접속해야 해요. (예: ngrok/터널 사용)");
    } else {
      alert("이 브라우저에서 마이크를 사용할 수 없습니다. 권한/브라우저를 확인하세요.");
    }
    return;
  }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try { wsRef.current?.send("EOS"); } catch { }
    try { if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") mediaRecRef.current.stop(); } catch { }
    mediaRecRef.current = null;
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }

    const prevState = composing;

    // 저장용 원문 최종 텍스트(= final + partial)
    const rawFinal = (
      (utterRawRef.current.final || "") +
      (utterRawRef.current.partial
        ? (utterRawRef.current.final ? " " : "") + utterRawRef.current.partial
        : "")
    ).trim();

    if (prevState.active && !commitLockRef.current && rawFinal) {
      const newId = Date.now() + Math.random();

      // 화면용은 마스킹
      const viewText = exposureOn ? maskDotsToStars(rawFinal) : rawFinal;

      const detectedLabel = await sendToServer(prevState.who || "me", rawFinal);
      const finalEmotion = (detectedLabel || emotion || "calm").toLowerCase();

      setChat([{ id: newId, who: prevState.who || "me", text: viewText }]);
      setHeroId(newId);

      const audioBlob = new Blob(currentChunksRef.current, { type: "audio/ogg;codecs=opus" });
      const endedAt = Date.now();
      const bubbleForSession = {
        id: newId,
        speaker: prevState.who || "me",
        text: viewText,                  // ✅ DB 저장은 원문
        startedAt: utterStartRef.current,
        endedAt,
        durationMs: Math.max(0, endedAt - (utterStartRef.current || endedAt)),
        audioBlob,
        emotion: finalEmotion || "calm",
      };
      setSessionBubbles((old) => [...old, bubbleForSession]);

      // sendToServer(prevState.who || "me", rawFinal);
      commitLockRef.current = true;
    }

    // 진행중 상태 정리
    setComposing({ active: false, who: null, text: "" });
    setPartialText("");
    scrollToBottom();
  };

  /** ---------- 테스트 전송 (그대로 유지) ---------- */
  const sendToServer = async (who, text) => {
    console.log("📤 서버 전송 시도:", { speaker: who, content: text });
    try {
      const data = await RecordsAPI.sendTextForEmotion({
        speaker: who,
        content: text,
      });
      console.log("✅ 서버 응답:", data);
      const label = (data?.label || "").toLowerCase();
      if (label) setEmotion(label);   // 화면 상태 갱신
      setAngryStreak(prev => {
     const next = isAngry(label) ? prev + 1 : 0;
     console.log("[ANGRY] label =", label, "prev =", prev, "→ next =", next);
     if (next >= 3 && !showAngryBanner) {
      console.log("[ANGRY] threshold reached → open modal");
       setShowAngryBanner(true);
     }
     return next;
   });
      return label || null;
    } catch (err) {
      console.error("❌ 서버 전송 실패:", err);
      return null;
    }
  };
//   useEffect(() => {
//     if (!emotion) return;
//  setAngryStreak((prev) => {
//    const next = isAngry(emotion) ? prev + 1 : 0;
//    console.log("[ANGRY] emotion:", emotion, "→ streak:", next);
//    return next;
//  });
//   }, [emotion]);

  useEffect(() => {
    if (angryStreak >= 3) {
   console.log("[ANGRY] show modal, streak:", angryStreak);
      
      setShowAngryBanner(true);
      // 자동 닫기 원하면 10초 뒤 닫기
      // const t = setTimeout(() => setShowAngryBanner(false), 10000);
      // return () => clearTimeout(t);
    }
  }, [angryStreak]);

  /** ---------- 저장/취소 ---------- */
  const cancelSession = () => {
    // 화면/세션 초기화 (DB 저장 없이 날림)
    setChat([]);
    setHeroId(null);
    setSessionBubbles([]);
    setAngryStreak(0); // ← 추가
    setShowAngryBanner(false); // ← 추가
  };

  // 실제 저장용 FormData 구성 (메타 + 파일들)
  const buildFormData = ({ recordListId, recordListTitle }) => {
    const meta = sessionBubbles.map((b, i) => ({
      // ✅ 백엔드가 요구하는 필드들
      bTalker: b.speaker || "me", // boolean 으로 변환
      bText: b.text,
      bEmotion: b.emotion || emotion || "calm", // Enum 매핑 대비
      bLength: null, // 길이는 서버에서 durationMs로 보정
      durationMs: b.durationMs,

      // (참고) 디버깅/추적용으로 기존 값들도 같이 보낼 수 있다면:
      id: b.id,
      startedAt: b.startedAt,
      endedAt: b.endedAt,

      // 버블 오디오 파일 필드명
      fileField: `audio_${i}`,
    }));
    const form = new FormData();
    form.append(
      "record",
      new Blob(
        [
          JSON.stringify({
            voiceField: null, // 세션 통짜 오디오 쓸 거면 필드명 넣기
            record: {
              // ✅ 반드시 포함
              rlId: recordListId ?? null,
              rLength: null,
              rVoice: null,
            },
            bubbles: meta, // meta에 fileField: "audio_i", durationMs 포함
            recordListTitle: recordListTitle || null, // ← 없으면 null                    // 새 리스트 생성 시 제목
            userId: userId, // (선택) 서버에서 SecurityContext 쓰면 생략 가능
          }),
        ],
        { type: "application/json" }
      )
    );
    sessionBubbles.forEach((b, i) =>
      form.append(`audio_${i}`, b.audioBlob, `utt_${i}.ogg`)
    );

    return form;
  };

  const saveSession = async ({ recordListId, recordListTitle }) => {
    if (sessionBubbles.length === 0) return;
    try {
      const form = buildFormData({ recordListId, recordListTitle });

      // ✅ 여기서 디버깅!
      await debugForm(form);

      const data = await RecordsAPI.saveRecord(form);
      console.log("✅ 저장 완료:", data);

      setChat([]);
      setHeroId(null);
      setSessionBubbles([]);
      setEmotion("calm");
      setShowSave(false);
      setAngryStreak(0); // ← 추가
      setShowAngryBanner(false); // ← 추가
    } catch (e) {
      console.error("❌ 저장 실패:", e);
    }
  };

  /** ---------- UI handlers ---------- */
  const onPartnerClick = async () => {
    if (!isRecording) await startRecording("partner");
    else stopRecording();
  };
  const onMeClick = async () => {
    if (!isRecording) await startRecording("me");
    else stopRecording();
  };

  /** ---------- lifecycle ---------- */
  useEffect(() => {
    return () => {
      try {
        mediaRecRef.current?.stop();
      } catch { }
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      disconnectWS();
    };
  }, []);
  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  // 감정 key -> EMOTIONS 메타
const getEmotionMeta = (key) => {
  const k = (key || "calm").toLowerCase();
  return EMOTIONS.find(e => e.key === k) || EMOTIONS.find(e => e.key === "calm");
};

const meta = getEmotionMeta(emotion);
const nameKo = meta?.name || "차분";      // 예: "행복", "차분", "공포" …
const [leftChar = "", rightChar = ""] = nameKo.split(""); // ["행","복"]

// 테마별 감정 이미지 (Emotion.js의 image 사용)
const centerImg = meta?.image?.[currentTheme] || getEmotionImg(currentTheme, emotion);

  /** ---------- render ---------- */
  return (
    <div className="h-full bg-text-200 flex flex-col relative">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-8">
        <FaBook
          className="text-white h-5 w-5"
          onClick={() => setShowEmotion(true)}
        />
        <div className="text-base text-white font-semibold">
          {isRecording ? "▶ 녹음 중..." : "⏸ 녹음 중지"}
        </div>
        <FiHelpCircle
          className="text-white h-6 w-6"
          onClick={() => setShowHelp(true)}
        />
      </div>
      {/* 🔴 화남 3연속 감지 배너 */}
      <AngryModal
        open={showAngryBanner}
        onClose={() => {
          setShowAngryBanner(false);
          setAngryStreak(0);
        }}
        onGuide={() => {
          setShowHelp(true);
        }}
      />

      {/* 상단: 상대 버튼 */}
      {/* <div
        onClick={onPartnerClick}
        className={`cursor-pointer mx-auto w-20 h-20 rounded-full bg-white border-4 flex items-center justify-center 
          ${
            isRecording && role === "partner"
              ? "border-cloud-parter"
              : "border-cloud-partner"
          }`}
        title={
          isRecording && role === "partner" ? "녹음 종료" : "상대방 녹음 시작"
        }
      >
        <span className="w-12 h-12">
          <img src="src/assets/images/구르미.svg" />
        </span>
      </div> */}
      <RecordButton
        role="partner"
        isRecording={isRecording}
        activeRole={role}
        onClick={onPartnerClick}
        title={
          isRecording && role === "partner" ? "녹음 종료" : "상대방 녹음 시작"
        }
        className="mx-auto"
      />

      {/* 중앙: 히어로(항상) + 채팅 */}
<div className="flex-1 px-6 overflow-hidden flex flex-col items-center">
  {/* 1 히어로: 항상 표시, 상태에 따라 소스/투명도 변경 */}
  <div className="mt-4 flex flex-col items-center space-y-2">
    <div className="flex justify-center my-3 relative">
         {chat.length > 0 && !composing.active && (
  <div
    className="absolute -left-10 top-1/2 -translate-y-1/2
               text-white text-xl font-kcc tracking-widest
               select-none pointer-events-none"
  >
    {leftChar}
  </div>
)}
     
      <AnimatePresence mode="wait">
        <motion.img
          key={`${currentTheme}-${emotion || "hero"}`} // 감정이 바뀔 때마다 다시 마운트
          src={getEmotionImg(currentTheme, emotion)}
          alt={emotion || "hero"}
          className={`${HERO_IMG_CLASS} ${
            composing.active ? "opacity-40" : "opacity-100"
          }`}
          initial={{ rotate: 0, opacity: 0 }}
          animate={{
            rotate: [0, -8, 8, -5, 5, 0], // 흔들 흔들
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </AnimatePresence>

{chat.length > 0 && !composing.active && (
  <div
    className="absolute -right-10 top-1/2 -translate-y-1/2
               text-white text-xl font-kcc tracking-widest
               select-none pointer-events-none"
  >
    {rightChar}
  </div>
)}

      {composing.active && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <LoadingSpinner />
        </div>
      )}
    </div>
    {/* 녹음 전, 첫 화면에서만 "새로운 녹음" 텍스트 표시 */}
    {!isRecording && chat.length === 0 && (
      <div className="text-white text-lg font-semibold">새로운 녹음</div>
    )}
  </div>


        {/* 2) 채팅/진행중 말풍선 영역: 스크롤 가능 */}
        <div className="w-full max-w-[720px] flex-1 overflow-y-auto">
          {chat.map((m) => (
            <div key={m.id}>
              <div className={`flex ${m.who === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-base leading-7 whitespace-pre-wrap
    ${getBubbleClass(m.who)}`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {/* 진행중 말풍선 */}
          {composing.active && (
            <div className={`flex ${composing.who === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-base leading-7 whitespace-pre-wrap opacity-95
    ${getBubbleClass(composing.who)}`}
              >
                {(composing.text ? composing.text + (partialText ? " " : "") : "") + (partialText || "")}
              </div>
            </div>
          )}

          <div ref={listEndRef} />
        </div>
      </div>
      {/* 하단: 내 버튼 */}
      {/* <button
        onClick={onMeClick}
        className={`absolute left-1/2 -translate-x-1/2
      bottom-[calc(env(safe-area-inset-bottom)+96px)]
      md:bottom-[calc(env(safe-area-inset-bottom)+187px)]
      w-20 h-20 rounded-full bg-white border-4 shadow-xl flex items-center justify-center
      ${
        isRecording && role === "me"
          ? "border-cloud-partner"
          : "border-cloud-mine"
      }`}
      >
        <span className="w-12 h-12">
          <img src="src/assets/images/구르미.svg" />
        </span>
      </button> */}
      {/* 하단: 내 버튼 + 취소/저장 (버튼 옆 배치) */}
      <div className="mt-3 pb-[calc(env(safe-area-inset-bottom)+140px)]">
        <div className="flex items-center justify-center gap-12 select-none">
          {/* 왼쪽: 취소 (결과가 있을 때만 표시) */}
          {!isRecording && (chat.length !== 0 || hasRecording) && (
            <button
              onClick={() => setRecordClose(true)}
              className="text-white text-lg font-semibold opacity-90"
            >
              취소
            </button>
          )}

          {/* 가운데: 녹음 버튼 */}
          <RecordButton
            role="me"
            isRecording={isRecording}
            activeRole={role}
            onClick={onMeClick}
            title={isRecording && role === "me" ? "녹음 종료" : "내 녹음 시작"}
            className="shrink-0"
          />

          {/* 오른쪽: 저장 (결과가 있을 때만 표시) */}
          {!isRecording && (chat.length !== 0 || hasRecording) && (
            <button
              onClick={() => setShowSave(true)}
              className="text-white text-lg font-semibold opacity-90"
            >
              저장
            </button>
          )}
        </div>
      </div>

      {showHelp && <HelpScreen onClose={() => setShowHelp(false)} />}
      {showEmotion && <EmotionCard onClose={() => setShowEmotion(false)} />}
      <SaveDialog
        open={showSave}
        onClose={() => setShowSave(false)}
        lists={recordLists}
        onConfirm={(payload) => saveSession(payload)}
      />
      <ConfirmModal
        isOpen={recordClose}
        title="정말 취소하시겠습니까?"
        description="녹음 기록이 지워집니다."
        onConfirm={() => {           // ✅ 확인 → 세션 취소 + 모달 닫기
          cancelSession();
          setRecordClose(false);
        }}
        onCancel={() => setRecordClose(false)}   // ✅ 취소 → 모달 닫기
      />
    </div>
  );
}
