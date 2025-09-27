// 1) 테마별 감정 아이콘을 한 번에 
const cloudImgs = import.meta.glob("../assets/images/emotion/cloud_*.png", {
  eager: true,
  import: "default",
});
const bearImgs = import.meta.glob("../assets/images/emotion/bear_*.png", {
  eager: true,
  import: "default",
});

// 2) 파일 키를 안전하게 꺼내는 헬퍼
const img = (theme, key) => {
  const map = theme === "bear" ? bearImgs : cloudImgs;
  return map[`../assets/images/emotion/${theme}_${key}.png`] ?? "";
};

// 3) 감정 목록
const EMOTIONS = [
  {
    id: 1,
    key: "happy",
    name: "행복",
    description: [
      "이 표정은 상대방, 혹은 내가",
      "기분이 아주 좋은 상태임을 말합니다.",
      "",
      "이럴 때는 호응을 해주거나 맞장구를 쳐주세요!",
    ],
    image: { cloud: img("cloud", "happy"), bear: img("bear", "happy") },
  },
  {
    id: 2,
    key: "calm",
    name: "차분",
    description: [
      "이 표정은 상대방, 혹은 내가",
      "차분하게 상대의 얘기를 들을 준비가 되었다는 뜻이에요.",
      "",
      "이럴 때는 상대의 말에 귀 기울여 주세요!",
    ],
    image: { cloud: img("cloud", "calm"), bear: img("bear", "calm") },
  },
  {
    id: 3,
    key: "sad",
    name: "슬픔",
    description: [
      "이 표정은 상대방, 혹은 내가",
      "기분이 안좋은 일이 생겼다는 거에요.",
      "",
      "이럴 때는 위로의 말을 건내주세요!",
    ],
    image: { cloud: img("cloud", "sad"), bear: img("bear", "sad") },
  },
  {
    id: 4,
    key: "scared",
    name: "공포",
    description: [
      "이 표정은 상대방, 혹은 내가",
      "무서워하는 상태임을 말합니다.",
      "",
      "이럴 때는 진정시켜주는 말을 건네주세요!",
    ],
    image: { cloud: img("cloud", "scared"), bear: img("bear", "scared") },
  },
  {
    id: 5,
    key: "angry",
    name: "화남",
    description: [
      "이 표정은 상대방, 혹은 내가",
      "불쾌하고 공격적인 감정임을 뜻합니다.",
      "",
      "이럴 때는 차분하게 진정할 수 있는 말을 건네주세요!",
    ],
    image: { cloud: img("cloud", "angry"), bear: img("bear", "angry") },
  },
  {
    id: 6,
    key: "disgust",
    name: "혐오",
    description: [
      "이 표정은 상대방, 혹은 내가",
      "화나고 짜증나는 상태임을 말합니다.",
      "",
      "이럴 때는 잠시 기다려주세요!",
    ],
    image: { cloud: img("cloud", "disgust"), bear: img("bear", "disgust") },
  },
  {
    id: 7,
    key: "surprised",
    name: "놀람",
    description: [
      "이 표정은 상대방, 혹은 내가",
      "예상치 못한 상황이 생겼다는 것을 말합니다.",
      "",
      "이럴 때는 침착하게 한번 더 생각해주세요!",
    ],
    image: { cloud: img("cloud", "surprised"), bear: img("bear", "surprised") },
  },
];

export default EMOTIONS;
