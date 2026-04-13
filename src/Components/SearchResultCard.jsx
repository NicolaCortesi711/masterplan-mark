/**
 * Card di un singolo risultato di ricerca.
 *
 * Mostra nome azienda, stand, settore e tipologia.
 * Il bottone "Vai alla mappa" chiude l'overlay e sposta la camera sul POI.
 * Il bottone "Scheda azienda" apre il link esterno in un nuovo tab (solo se presente).
 *
 * @param {object} vendor - Dati del venditore (nome_azienda, tipologia, link, ...)
 * @param {object} poi    - POI a cui appartiene il vendor (stand, settore, id, ...)
 * @param {function} onSelect - Callback (poi, vendor) → chiude overlay e focalizza il POI
 */
export default function SearchResultCard({ vendor, poi, onSelect }) {
  return (
    <div className="search-result-card">
      <div className="search-result-card-header">{vendor.nome_azienda}</div>
      <div className="search-result-card-body">
        <p className="search-result-card-tipologia">
          Stand {poi.stand} — {poi.settore}
          {vendor.tipologia && (
            <>
              <br />
              {vendor.tipologia}
            </>
          )}
        </p>
        <button
          className="search-result-card-btn"
          onClick={() => onSelect(poi, vendor)}
        >
          Vai alla mappa
        </button>
        {vendor.link && (
          <button
            className="search-result-card-btn"
            onClick={() => window.open(vendor.link, "_blank", "noreferrer")}
          >
            Scheda azienda
          </button>
        )}
      </div>
    </div>
  );
}
