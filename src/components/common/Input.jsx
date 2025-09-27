// 아주 단순한 텍스트 인풋 컴포넌트
export default function Input({
  id,
  label,            // 라벨 텍스트 (없으면 라벨 렌더 안 함)
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,            // 문자열이면 아래에 에러 표시 + 테두리 붉게
  className = "",   // 외부 여백 조절용 (ex. "mt-3")
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  const describedBy = error ? `${inputId}-error` : undefined;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={[
          "w-full h-11 rounded-xl border px-4",
          "bg-white text-slate-900 placeholder:text-slate-400",
          "shadow-sm outline-none transition",
          error
            ? "border-primary focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            : "border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        ].join(" ")}
        {...props}
      />

      {error && (
        <p id={describedBy} className="mt-1 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}