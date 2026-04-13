import { useState, useEffect, useRef, memo } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";

export default memo(function Chatbot() {
  const [state, setState] = useState("closed"); // "closed" | "open" | "minimized"
  const [showTooltip, setShowTooltip] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (state === "closed") setShowTooltip(true);
    if (state === "open") {
      setTimeout(() => iframeRef.current?.focus(), 100);
    }
  }, [state]);

  return (
    <div
      style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {/* Iframe — sempre montato, visibile solo se "open" */}
      <div
          style={{
            position: "absolute",
            bottom: "0px",
            right: "62px",
            width: "450px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            display: state === "open" ? "block" : "none",
          }}
        >
          {/* Bottoni sovrapposti in alto a destra */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "20px",
              display: "flex",
              gap: "8px",
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setState("minimized")}
              style={{
                background: "#B9B5B5",
                border: "none",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                padding: 0,
              }}
            >
              <ChevronDown size={16} />
            </button>
            <button
              onClick={() => setState("closed")}
              style={{
                background: "#B9B5B5",
                border: "none",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
          <iframe
            ref={iframeRef}
            src={import.meta.env.VITE_CHATBOT_URL}
            width="450"
            height="600"
            tabIndex={0}
            style={{ border: "none", display: "block", background: "white" }}
          />
        </div>

      {/* Tooltip suggerimento */}
      {state === "closed" && showTooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "68px",
            right: "0",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#333" }}>
            Fai una domanda!
          </span>
          <button
            onClick={() => setShowTooltip(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "#999",
            }}
          >
            <X size={14} />
          </button>
          {/* Coda del fumetto */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              right: "18px",
              width: "16px",
              height: "16px",
              background: "white",
              transform: "rotate(45deg)",
              boxShadow: "2px 2px 4px rgba(0,0,0,0.08)",
              borderRadius: "2px",
            }}
          />
        </div>
      )}

      {/* Riga in basso: barra minimizzata (se presente) + logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "flex-end",
        }}
      >
        {/* Barra minimizzata */}
        {state === "minimized" && (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              height: "52px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              Assistente virtuale
            </span>
            <button
              onClick={() => setState("open")}
              style={{
                background: "#B9B5B5",
                border: "none",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                padding: 0,
              }}
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => setState("closed")}
              style={{
                background: "#B9B5B5",
                border: "none",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Logo */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={import.meta.env.BASE_URL + "logo-car.png"}
            alt="Chatbot"
            data-cursor-hover
            onClick={() => {
              setState("open");
              setShowTooltip(false);
            }}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              userSelect: "none",
              display: "block",
            }}
          />
          {/* Indicatore online */}
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid white",
            }}
          />
        </div>
      </div>
    </div>
  );
})
