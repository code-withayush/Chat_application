// src/components/Avatar.jsx

export default function Avatar({ name, color, size = "md", online = false, img = null }) {
  const sizes = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-xl",
    xl: "w-20 h-20 text-3xl",
  };
  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white overflow-hidden`}
        style={{ backgroundColor: color || "#7C3AED" }}
      >
        {img
          ? <img src={img} alt={name} className="w-full h-full object-cover" />
          : name?.[0]?.toUpperCase() || "?"}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-dark-200" />
      )}
    </div>
  );
}