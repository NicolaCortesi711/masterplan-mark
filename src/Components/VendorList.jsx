import { ChevronRight, Phone } from "lucide-react";

export default function VendorList({ venditori, poi, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header stand */}
      <div style={{ padding: "18px 18px 0" }}>
        <div
          style={{
            width: "100%",
            height: "80px",
            borderRadius: "20px 20px 0px 0px",
            background: "linear-gradient(135deg, #69a2a1 0%, #016B69 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: "700",
              fontFamily: "sans-serif",
              opacity: 0.8,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {poi?.settore}
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "16px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxHeight: "380px",
          overflowY: "auto",
        }}
      >
        {venditori.map((v, i) => (
          <div
            key={i}
            onClick={() => onSelect(v)}
            style={{
              background: "rgba(0,0,0,0.04)",
              borderRadius: "20px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 3px",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111",
                  fontFamily: "sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {v.nome_azienda}
              </p>
              {v.telefono && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "#555",
                    fontFamily: "sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Phone size={11} /> {v.telefono}
                </p>
              )}
            </div>
            <button
              onClick={() => onSelect(v)}
              style={{
                flexShrink: 0,
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "#1C7878",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
