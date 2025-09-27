export default function Title({ children, variant = "default", className = "", icon }) {
  const base = "font-bold text-center relative " + className;

  const styles = {
    auth: "text-4xl text-primary " + base,   // 로그인/회원가입용
    default: "text-2xl text-black " + base,      // 일반 페이지용
  };

  return (
    <div className={`${styles[variant]} ${className}`}>
      {icon && (
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}