import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header";
import { FaRegEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import SectionHeader from "../components/SectionHeader";
import Bubble from "../components/Bubble";
import EMOTIONS from "../data/Emotion.js";
import { createPortal } from "react-dom";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useRecords } from "../hooks/useRecords.js";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import api from "../api/api";

export default function RecordDetail() {
  const { user } = useAuth();
  const userId = user?.uId;
  const { currentTheme } = useTheme(); // 전역 테마 (cloud | bear)

  const { rlId } = useParams(); // 문자열 "6"로 들어옴
  const rlIdNum = Number(rlId); // 숫자 6으로 변환

  const { title, setTitle, sections, loading, error } = useRecords(
    rlId,
    userId
  );
  const { audioRef, activeRecId, playing, playSection, getProgressOf, seek } =
    useAudioPlayer();

  // 컴포넌트 최상단
  const [localSections, setLocalSections] = useState(sections);

  // useEffect로 훅에서 sections가 바뀌면 localSections 동기화
  useEffect(() => {
    if (sections.length > 0 && localSections.length === 0) {
      setLocalSections(sections);
    }
  }, [sections]);

  // 제목 인라인 수정
  const [editTitleValue, setEditTitleValue] = useState(""); // input에서 편집 용 상태 ... 취소 버튼 위해
  useEffect(() => {
    setEditTitleValue(title);
  }, [title]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  // 리스트 제목 수정 ... 백엔드 컨트롤러 호출
  const handleUpdateTitle = async (rlId, editTitleValue) => {
    if (title === editTitleValue) {
      // 제목 변경 없으면 리턴
      return;
    }
    try {
       const res = await api.put(
   `/api/records/record-list/${rlId}`,
   { rlName: editTitleValue, uId: userId }
 );
      // 성공 시 화면 반영
      setTitle(res.data.rlName);
      setEditTitleValue(res.data.rlName); // 편집 상태도 갱신
      setIsEditingTitle(false); // 편집 모드 종료
    } catch (err) {
      console.error("수정 실패:", err);
      alert("녹음 리스트 제목 수정에 실패했습니다.");
    }
  };

  // 말풍선 편집 시트
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTalk, setEditingTalk] = useState(null); // { sectionId, talkId, text }

  // 말풍선 활성화를 위한 현재 ms
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let raf;
    const tick = () => {
      setCurrentTimeMs(a.currentTime * 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioRef]);

  // 선택/삭제 상태
  const [selectMode, setSelectMode] = useState(false);
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [targetSectionIds, setTargetSectionIds] = useState([]); // 삭제 대상
  // 섹션 토글/삭제
  const toggleSection = (rId) => {
    setSelectedSectionIds((prev) =>
      prev.includes(rId) ? prev.filter((x) => x !== rId) : [...prev, rId]
    );
  };
  // 녹음 다중 삭제 ... 백엔드 컨트롤러 호출
  const handleDeleteSections = async (idsToDelete) => {
    if (!idsToDelete || idsToDelete.length === 0) return;

    try {
      // console.log(selectedSectionIds);
      await api.delete("/api/records/record", {
   data: idsToDelete.map(Number),
 });

      // 성공 시 프론트에서 선택 삭제 반영
      // sections는 useRecords 훅에서 가져온 상태
      const remain = localSections.filter((s) => !idsToDelete.includes(s.rId));
      setLocalSections(remain);
      // sections를 훅에서 내려준 상태라면 재조회가 필요하지만,
      // 화면에서 바로 제거하려면 로컬 상태를 따로 관리하거나 훅 재조회
      setSelectedSectionIds([]);
      setSelectMode(false);
      console.log("삭제 완료. 남은 섹션 수:", remain.length);

      // 선택 삭제 후 화면 갱신 (예: useRecords 훅 재조회)
      // setSections(remain); // 훅이 로컬 상태를 반환하도록 구현돼 있다면 가능
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("녹음 삭제에 실패했습니다.");
    }
  };

  // 말풍선 편집
  const openEditTalk = (sectionId, bId, currentText, currentEmotion) => {
    setEditingTalk({ 
      sectionId, 
      bId, 
      text: currentText,
      emotion: typeof currentEmotion === "string" ? currentEmotion : currentEmotion?.name || "",
    });
    setSheetOpen(true);
  };
  const saveTalkText = async () => {
    if (!editingTalk) return;

    console.log("PUT payload:", { bText: editingTalk.text, bEmotion: editingTalk.emotion });

    try {
      const res = await api.put(
   `/api/records/bubble/${editingTalk.bId}`,
   { bText: editingTalk.text, bEmotion: editingTalk.emotion }
 );
      const { bText, bEmotion } = res.data;

      setLocalSections((prevSections) =>
        prevSections.map((sec) => {
          if (sec.id !== editingTalk.sectionId) return sec;

          return {
            ...sec,
            talks: sec.talks.map((t) =>
              t.bId === editingTalk.bId ? { ...t, text: bText, emotion: bEmotion } : t
            ),
          };
        })
      );

      setSheetOpen(false); // sheet 닫기
      setEditingTalk(null); // editingTalk 초기화
    } catch (err) {
      console.error("버블 수정 실패:", err);
      alert("버블 수정에 실패했습니다.");
    }
  };

  const TABBAR_H = 100;

  return (
    <div
      className={
        "relative w-full bg-background " +
        (sheetOpen
          ? "overflow-hidden overscroll-none"
          : "overflow-y-auto pb-24") +
        " h-[111dvh] md:h-[100svh] md:max-w-[390px] md:mx-auto md:rounded-xl"
      }
    >
      {/* 공용 오디오(숨김) */}
      <audio ref={audioRef} className="hidden" />

      {/* HEADER */}
      <Header
        center={false}
        shadow={true}
        fix={true}
        title={
          isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                className="w-40 bg-transparent outline-none border-b border-slate-300 text-base"
              />
              <button
                onClick={() => {
                  handleUpdateTitle(rlIdNum, editTitleValue); // 저장 후 화면 반영
                }}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <span className="px-2 py-1 rounded-md bg-button-edit text-white">
                  수정
                </span>
              </button>
              <button
                onClick={() => {
                  setEditTitleValue(title); // 원래 값으로 되돌리기
                  setIsEditingTitle(false);
                }}
                className="flex items-center gap-2 text-sm text-slate-600 rounded-md border border-slate-300"
              >
                <span className="px-2 py-1 rounded-md">취소</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {title}
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <FaRegEdit className="w-4 h-4 -top-[1px] relative" />
              </button>
            </div>
          )
        }
        rightSlot={
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <button
                  onClick={() => {
                    setTargetSectionIds(selectedSectionIds); // 선택된 섹션 저장
                    setOpenDeleteModal(true); // 모달 열기
                  }}
                  className="flex items-center gap-1 text-sm text-red-600"
                >
                  <FiTrash2 className="w-4 h-4 -top-[1px] relative" />
                </button>
                <button
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedSectionIds([]);
                  }}
                  className="text-sm text-slate-600"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSelectMode(true)}
                  className="text-sm text-slate-600"
                >
                  선택
                </button>
              </>
            )}
          </div>
        }
      />

      {/* CONTENT */}
      <div className="px-4 pb-24">
        {loading && (
          <div className="py-8 text-center text-slate-500">불러오는 중…</div>
        )}
        {error && (
          <div className="py-2 text-center text-red-500 text-sm">{error}</div>
        )}
        {!loading && localSections.length === 0 && !error && (
          <div className="py-8 text-center text-slate-500">
            기록이 없습니다.
          </div>
        )}

        {localSections.map((sec) => {
          const checked = selectedSectionIds.includes(sec.id);
          const isActiveSection = sec.rId === activeRecId;
          const nowMs = isActiveSection ? currentTimeMs : -1;

          return (
            <div key={sec.id} className="relative">
              <div className="relative">
                <SectionHeader
                  {...sec.header}
                  onPlay={() => playSection(sec)}
                  progress={getProgressOf(sec)}
                  onSeek={(r) => seek(sec, r)}
                  isActive={isActiveSection}
                  isPlaying={playing}
                  currentMs={isActiveSection ? nowMs : 0}   // 추가
                  totalMs={sec.header.totalMs}              // 추가
                />
                {selectMode && (
                  <label className="absolute right-1 top-2 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedSectionIds.includes(sec.rId)}
                      onChange={() => toggleSection(sec.rId)}
                      className="accent-purple-600 w-4 h-4"
                    />
                  </label>
                )}
              </div>

              <div className="bg-white rounded-3xl pt-1 pb-3 px-3">
                {sec.talks.map((t) => {
                  return (
                    <div key={t.bId}>
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          openEditTalk(sec.id, t.bId, t.text, t.emotion);
                          console.log("Clicked Bubble Id : ", t.bId);
                        }}
                        // onClick={() => {
                        //   const a = audioRef.current;
                        //   if (!a) return;
                        //   // 현재 섹션이 아니면 먼저 섹션 재생(소스 세팅)
                        //   if (!isActiveSection) {
                        //     playSection(sec);
                        //   }
                        //   // 해당 말풍선 시작으로 점프
                        //   a.currentTime = t.startMs / 1000 + 0.01;
                        //   a.play();
                        // }}
                      >
                        <Bubble 
                          id={t.bId} // DB bId
                          me={t.me}
                          text={t.text}
                          sub={t.sub}
                          isActive={nowMs >= t.startMs && nowMs < t.endMs}
                          emotion={t.emotion}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 h-px w-full bg-slate-200" />
            </div>
          );
        })}
      </div>

      {/* ===== Bubble Update Sheet ===== */}
      {sheetOpen &&
        editingTalk &&
        createPortal(
          <div className="absolute inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 rounded-3xl"
              onClick={() => {
                setSheetOpen(false);
                setEditingTalk(null);
              }}
            />

            <div
              className="fixed left-1/2 -translate-x-1/2 md:translate-y-12 translate-y-[98px] w-full md:max-w-[390px] pointer-events-none"
              style={{ bottom: `calc(${TABBAR_H}px)` }}
            >
              <div className="pointer-events-auto w-full rounded-b-2xl rounded-t-[40px] bg-white shadow-xl">
                <div className="text-lg font-semibold mb-3 mt-3 pt-6 pb-2 text-center">
                  녹음 내용 수정하기
                </div>
                <div className="flex justify-center flex-wrap mt-4 px-4 pb-6">
                    {EMOTIONS.map((em) => {
                      const selected = editingTalk?.emotion === em.key; // 현재 선택된 감정과 비교
                      return (
                        <div
                          key={em.id}
                          className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer
                            transition-all duration-200 transition-transfrom
                            ${selected ? "shadow-[0_0_8px_rgba(126,104,255,0.7)] scale-110" : "ring-0 scale-100"}
                          `}
                          onClick={() =>
                            setEditingTalk(prev => prev ? { ...prev, emotion: em.key } : prev)
                          }
                        >
                          <img src={em.image[currentTheme]} alt={em.key} className="w-16 h-16 object-cover" />
                        </div>
                      );
                    })}
                </div>
                <div className="px-4 pb-4">
                  <textarea
                    className="w-full min-h-[140px] rounded-xl border border-slate-200 p-3 outline-none"
                    value={editingTalk.text}
                    onChange={(e) =>
                      setEditingTalk((prev) => prev ? { ...prev, text: e.target.value } : prev )
                    }
                  />
                  <div className="flex justify-between gap-2 mt-3">
                    <button
                      className="px-4 py-2 rounded-xl border border-slate-300"
                      onClick={() => {
                        setSheetOpen(false);
                        setEditingTalk(null);
                      }}
                    >
                      취소
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white"
                      onClick={saveTalkText}
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      <ConfirmModal
        isOpen={openDeleteModal}
        title="정말 삭제하시겠습니까?"
        description="선택한 녹음 기록이 사라집니다."
        onConfirm={async () => {
          setOpenDeleteModal(false); // 모달 닫기
          await handleDeleteSections(targetSectionIds); // 실제 삭제
          setTargetSectionIds([]); // 초기화
        }}
        onCancel={() => {
          setOpenDeleteModal(false);
          setTargetSectionIds([]);
        }}
      />
    </div>
  );
}
