import { ChevronLeft } from "lucide-react";

const Row = ({ label, value }) => {
  if (!value) return null;
  return (
    <p style={{ margin: 0, fontSize: "16px", fontFamily: "sans-serif", color: "#333" }}>
      <span style={{ fontWeight: "400", color: "#333" }}>{label}: </span>
      <span style={{ fontWeight: "700", color: "#111" }}>{value}</span>
    </p>
  );
};

const RowLink = ({ label, value, href }) => {
  if (!value) return null;
  return (
    <p style={{ margin: 0, fontSize: "16px", fontFamily: "sans-serif", color: "#333" }}>
      <span style={{ fontWeight: "400", color: "#333" }}>{label}: </span>
      <a href={href} style={{ fontWeight: "700", color: "#016B69", textDecoration: "none" }}>
        {value}
      </a>
    </p>
  );
};

export default function VendorDetail({ vendor, poi, onBack, showBack = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "18px 18px 0" }}>
        <div
          style={{
            width: "100%",
            borderRadius: "20px 20px 0px 0px",
            background: "linear-gradient(135deg, #69a2a1 0%, #016B69 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 0",
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}car-logo-card.webp`}
            alt=""
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
          />
        </div>
      </div>

      <div
        style={{
          padding: "18px 20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {showBack && (
          <button
            onClick={onBack}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "#016B69",
              fontFamily: "sans-serif",
              fontSize: "14px",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "#016B69",
                color: "white",
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={16} />
            </span>
            Torna alla lista
          </button>
        )}

        <p
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "700",
            color: "#111",
            fontFamily: "sans-serif",
          }}
        >
          {vendor.nome_azienda}
        </p>

        <div
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(0,0,0,0.08)",
          }}
        />

        <Row label="P. IVA" value={vendor.p_iva} />
        <RowLink label="Telefono" value={vendor.telefono} href={`tel:${vendor.telefono}`} />
        <RowLink label="Email" value={vendor.email} href={`mailto:${vendor.email}`} />
        <Row label="Settore" value={poi?.settore} />
        <Row label="Tipologia" value={vendor.tipologia} />

        {vendor.link && (
          <>
            <a
              href={vendor.link}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "12px",
                width: "100%",
                padding: "12px 0",
                borderRadius: "30px",
                background: "#1E1E1E",
                color: "white",
                fontSize: "16px",
                fontFamily: "sans-serif",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Scheda azienda
            </a>
          </>
        )}
      </div>
    </div>
  );
}
