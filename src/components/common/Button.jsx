// src/components/Button.jsx
export default function Button({
  variant = "primary", // "primary" | "outline"
  children,
  full = false,
  size = "md", // "sm" | "md" | "lg"
  onClick,
  disabled,
  className = "",
  ...props
}) {
  // 사이즈별 스타일
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-base",
    // lg: "h-12 px-5 text-lg",
  };
  // 버튼 종류별 스타일
  const variants = {
    primary:
      "bg-primary text-white " +
      "hover:bg-primary shadow-sm " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 " +
      "disabled:bg-primary disabled:cursor-not-allowed",
    outline:
      "bg-white text-primary shadow-[0_0px_6px_rgba(169,96,176,0.4)] " +
      "hover:border-primary hover:bg-violet-50 " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 " +
      "disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-xl font-medium transition",
        sizes[size],
        variants[variant],
        full ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}