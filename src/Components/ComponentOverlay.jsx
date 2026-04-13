import { useState, useEffect } from "react";
import { X } from "lucide-react";
import VendorList from "./VendorList";
import VendorDetail from "./VendorDetail";

export default function FocusOverlay({ active, poi, focusedVendor, onClose }) {
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Reset alla lista quando cambia il POI; se arriva un vendor dalla ricerca, apri direttamente quello
  useEffect(() => {
    setSelectedVendor(focusedVendor ?? null);
  }, [poi?.id, focusedVendor]);

  if (!active) return null;

  const venditori = poi?.venditori ?? [];
  const isSingle = venditori.length === 1;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "50%",
          height: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingRight: "40px",
          pointerEvents: "none",
        }}
      >
        {/* Card */}
        <div
          style={{
            position: "relative",
            background: "rgba(240, 240, 240, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "30px",
            width: "72%",
            maxWidth: "400px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            overflow: "hidden",
            pointerEvents: "all",
          }}
        >
          {/* Bottone chiusura */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#C8C3C5",
              border: "2px solid #333",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b0aaac")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C8C3C5")}
          >
            <X size={20} color="#333" />
          </button>

          {/* Contenuto */}
          {isSingle ? (
            <VendorDetail vendor={venditori[0]} poi={poi} showBack={false} />
          ) : selectedVendor ? (
            <VendorDetail
              vendor={selectedVendor}
              poi={poi}
              onBack={() => setSelectedVendor(null)}
            />
          ) : (
            <VendorList
              venditori={venditori}
              poi={poi}
              onSelect={setSelectedVendor}
            />
          )}
        </div>
      </div>
    </div>
  );
}
