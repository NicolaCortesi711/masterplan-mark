import { useState, useEffect, memo } from "react";
import { useProgress } from "@react-three/drei";

export default memo(function CustomLoader() {
  const { active, progress } = useProgress();
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!active && visible) {
      setOpacity(0);
      const t = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#E6F2F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "white",
        zIndex: 20000,
        fontFamily: "Inter, system-ui, sans-serif",
        opacity,
        transition: "opacity 0.8s ease",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 16, perspective: 800 }}>
        <img src={import.meta.env.BASE_URL + "logo-car.png"} alt="" />
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 260,
          height: 6,
          background: "#C9F0DE",
          border: "2px solid #1C7878",
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#1C7878",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
});
