import { forwardRef, useImperativeHandle, useState, useRef } from "react";

const HoverTooltip = forwardRef(function HoverTooltip(_, ref) {
  const [state, setState] = useState({ data: null, visible: false });
  const divRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show(newData, x, y) {
      // Posizione via DOM diretto — nessun re-render
      if (divRef.current) {
        divRef.current.style.transform = `translate(${x + 15}px, ${y - 10}px)`;
      }
      // Re-render solo se il POI cambia
      setState((prev) => ({
        visible: true,
        data: prev.data?.poi?.id === newData?.poi?.id ? prev.data : newData,
      }));
    },
    hide() {
      setState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    },
  }), []);

  const { data, visible } = state;
  if (!data) return null;

  const { poi, vendor } = data;
  const isSingle = poi.venditori?.length === 1;
  const isSingleLetter = /^[a-zA-Z]$/.test(poi.id?.trim());

  return (
    <div
      ref={divRef}
      className="hover-tooltip"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        display: visible ? "block" : "none",
        pointerEvents: "none",
      }}
    >
      {isSingleLetter ? (
        <>
          <div className="hover-tooltip-name">
            {isSingle ? poi.venditori[0].nome_azienda : poi.settore}
          </div>
          <div className="hover-tooltip-description">
            {isSingle ? poi.settore : `${poi.venditori.length} partners`}
          </div>
        </>
      ) : isSingle ? (
        <>
          <div className="hover-tooltip-name">{vendor?.nome_azienda}</div>
          <div className="hover-tooltip-description">Stand {poi.stand}</div>
          {poi.settore && (
            <div className="hover-tooltip-description">{poi.settore}</div>
          )}
        </>
      ) : (
        <>
          <div className="hover-tooltip-name">{poi.settore ?? `Stand ${poi.stand}`}</div>
          <div className="hover-tooltip-description">
            {poi.venditori?.length} partners
          </div>
        </>
      )}
    </div>
  );
});

export default HoverTooltip;
