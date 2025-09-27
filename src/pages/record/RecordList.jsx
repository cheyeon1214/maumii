// import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FaRegTrashAlt } from "react-icons/fa";
import CalendarBottomSheet from "../../components/CalendarBottomSheet";
import Header from "../../components/common/Header";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

export function formatKoreanDateTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true, // 24시간제 대신 오전/오후
  });
}

export default function RecordList() {
  // react state 에서 uId 값 가져오기
  const { user } = useAuth();
  const uId = user?.uId;

  const navigate = useNavigate();
  // 녹음 리스트 (API 연동)
  const [recordList, setRecordList] = useState([]); // 화면에 보여줄 리스트
  const [allRecords, setAllRecords] = useState([]); // 전체 녹음 리스트 저장
  // --- 탭 & 달력
  const [tab, setTab] = useState("recent"); // "recent" | "date"
  const [showCal, setShowCal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Date 객체 (자정 기준)
  // 리스트 검색
  const [open, setOpen] = useState(false); // 검색창 열고 닫기
  const [keyword, setKeyword] = useState(""); // input 값
  // 리스트 수정
  const [editingId, setEditingId] = useState(null);
  // 리스트 삭제
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [targetRecordListId, setTargetRecordListId] = useState(null);

  useEffect(() => {
    if (!uId) return; // 로그인 정보 없으면 실행 X
    // 백엔드 API 호출
      api.get(`/records/${uId}/record-list`)
      .then((res) => {
        console.log("API 응답 테스트 : ", res.data);
        setRecordList(res.data); // 화면용
        setAllRecords(res.data); // 저장용
      })
      .catch((err) => console.error(err));
  }, [uId]);

  const handleSearch = () => {
    if (!keyword) {
      setRecordList(allRecords);
      return;
    }

        api.get(`/records/${uId}/record-list/${encodeURIComponent(keyword)}`)
      
      .then((res) => {
        if (res.data.length === 0) {
          setRecordList(allRecords);
        } else {
          setRecordList(res.data);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleIconClick = () => {
    if (!open) {
      setOpen(true);
    } else {
      handleSearch();
    }
  };

  const handleUpdate = async (rlId, newName, rlText) => {
    try {
      const body = {
        rlName: newName,
        uId: uId, // props에서 바로 사용
      };
      const res = await api.put(`/records/record-list/${rlId}`, body);

      const updated = res.data;
      // recordList 업데이트
      setRecordList((prev) =>
        prev.map((r) =>
          r.rlId === rlId
            ? { ...updated, rlText: r.rlText } // rlText 유지
            : r
        )
      );
      // allRecords도 같이 업데이트
      setAllRecords((prev) =>
        prev.map((r) =>
          r.rlId === rlId ? { ...updated, rlText: r.rlText } : r
        )
      );

      setEditingId(null);
    } catch (err) {
      console.error("수정 실패:", err);
    }
  };

  const handleDelete = async () => {
    if (!targetRecordListId) return;
    try {
      await api.delete(`/records/record-list/${targetRecordListId}`);
      // recordList에서 삭제
      setRecordList((prev) =>
        prev.filter((r) => r.rlId !== targetRecordListId)
      );
      // allRecords에서도 삭제
      setAllRecords((prev) =>
        prev.filter((r) => r.rlId !== targetRecordListId)
      );
      setOpenDeleteModal(false); // 삭제 모달 닫기
      setTargetRecordListId(null);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("녹음 목록 삭제 중 오류가 발생했습니다.");
    }
  };

  /* ---------- utils ---------- */
  function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="mx-auto w-full h-40">
        {/* 헤더 */}
        <Header
          title="녹음 기록"
          center={true}
          shadow={true}
          fix={true}
        ></Header>
        {/* 탭 + 검색 */}
        <div className="pl-8 pr-6 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTab("recent");
                  setRecordList(allRecords);
                }}
                className={`h-10 w-16 rounded-full px-4 text-sm font-medium transition ${
                  tab === "recent"
                    ? "bg-button-nav text-white shadow"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                최근
              </button>
              <button
                onClick={() => {
                  setTab("date");
                  setShowCal(true);
                }}
                className={`h-10 w-16 rounded-full px-4 text-sm font-medium transition ${
                  tab === "date"
                    ? "bg-button-nav text-white shadow"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                날짜
              </button>
            </div>

            {/* 검색창 */}
            <div className="relative flex-2 items-center">
              <div
                className={`flex items-center h-10 border border-purple-300 bg-white shadow-[0_0_8px_rgba(166,144,255,0.7)]
                transition-all duration-500 ease-in-out overflow-hidden
                ${
                  open
                    ? "w-44 pl-3 pr-2 rounded-full"
                    : "w-10 justify-center rounded-full"
                }`}
              >
                <input
                  type="text"
                  placeholder="검색어 입력"
                  className={`text-sm outline-none transition-opacity duration-300
                  ${open ? "opacity-100 w-full" : "opacity-0 w-0"}`}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => setOpen(true)}
                  onBlur={() => setOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(); // 엔터로도 검색 가능
                  }}
                />
                <CiSearch
                  className="w-5 h-5 text-slate-800 cursor-pointer"
                  onClick={() => handleIconClick()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-6 pb-64">
        {/* 리스트 */}
        <ul className="space-y-4">
          {recordList.length === 0 && (
            <li className="px-6 py-10 text-center text-slate-400">
              선택한 날짜에 녹음이 없습니다.
            </li>
          )}

          {recordList.map((rec) => {
            const isEditing = editingId === rec.rlId;
            return (
              <li
                key={rec.rlId}
                className="rounded-[50px] bg-white h-20 p-4 pl-8 pr-5 shadow-[0_0px_5px_rgba(166,144,255,0.5)]"
              >
                <div className="flex w-full items-center gap-3 text-left">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/record-list/${rec.rlId}`)}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={rec.rlName || ""}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setRecordList((prev) =>
                                prev.map((r) =>
                                  r.rlId === rec.rlId
                                    ? { ...r, rlName: newName }
                                    : r
                                )
                              );
                            }}
                            // onBlur={() => setEditingId(null)} // input 밖 클릭 시 편집 종료
                            autoFocus
                            className="w-24 text-base font-semibold text-slate-900 border-b border-slate-300 outline-none"
                            onClick={(e) => e.stopPropagation()} // 여기서 부모 클릭 전파 막기
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdate(rec.rlId, rec.rlName);
                            }}
                            className="flex items-center text-sm text-slate-600"
                          >
                            <span className="px-2 py-1 rounded-md bg-button-edit text-white">
                              수정
                            </span>
                          </button>
                        </>
                      ) : (
                        <>
                          <h3 className="text-base font-semibold text-slate-900 cursor-pointer">
                            {rec.rlName}
                          </h3>
                        </>
                      )}
                      <span className="text-xs text-slate-500">
                        {formatKoreanDateTime(rec.updateDate)}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-slate-500">
                      {rec.rlText}
                    </p>
                  </div>

                  <div className="relative w-10 h-10">
                    <div
                      className={`absolute inset-0 transition-opacity duration-200 ${
                        isEditing
                          ? "opacity-0 pointer-events-none"
                          : "opacity-100"
                      }`}
                    >
                      <button
                        onClick={() => setEditingId(rec.rlId)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-button-edit shadow-inner"
                        title="이름 변경"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="white"
                        >
                          <path d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25Zm17.71-10.96a1 1 0 0 0 0-1.41l-2.59-2.59a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2.08-1.58Z" />
                        </svg>
                      </button>
                    </div>

                    <div
                      className={`absolute inset-0 transition-opacity duration-200 ${
                        isEditing
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setTargetRecordListId(rec.rlId);
                          setOpenDeleteModal(true);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full bg-rose-500 shadow-inner"
                        title="삭제"
                      >
                        <FaRegTrashAlt className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 날짜 탭일 때 달력 Bottom Sheet */}
      <CalendarBottomSheet
        open={tab === "date" && showCal}
        onClose={() => setShowCal(false)}
        selected={selectedDate}
        setSelected={(d) => {
          setSelectedDate(d);
          const filtered = allRecords.filter(
            (rec) => toYMD(new Date(rec.updateDate)) === toYMD(d)
          );
          setRecordList(filtered);
          setShowCal(false);
        }}
      />

      <ConfirmModal
        isOpen={openDeleteModal}
        title="정말 삭제하시겠습니까?"
        description="상대와의 전체 녹음 기록이 사라집니다."
        onConfirm={handleDelete}
        onCancel={() => {
          setOpenDeleteModal(false);
          setTargetRecordListId(null);
        }}
      />
    </div>
  );
}
