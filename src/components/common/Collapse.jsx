// src/components/Collapse.jsx
export default function Collapse({
  show,
  duration = 280,
  axis = "y", // "y"=세로, "x"=가로
  children,
}) {
  const sizeClass =
    axis === "y"
      ? show ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      : show ? "grid-cols-[1fr]" : "grid-cols-[0fr]";

  const overflowClass = axis === "y" ? "overflow-y-hidden" : "overflow-x-hidden";

  return (
    <div
      className={`grid transition-all ease-out ${sizeClass} ${
        show ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      <div className={overflowClass}>{children}</div>
    </div>
  );
}