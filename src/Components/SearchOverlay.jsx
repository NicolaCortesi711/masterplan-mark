import { useSearch } from "./useSearch";
import SearchResultCard from "./SearchResultCard";

export default function SearchOverlay({ isOpen, onClose, onSelectBuilding }) {
  const {
    filters,
    searchResults,
    settori,
    tipologie,
    handleFilterChange,
    handleSearch,
    handleReset,
  } = useSearch();

  const handleSelect = (poi, vendor) => {
    onSelectBuilding(poi, vendor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div
        className="search-overlay-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="search-overlay-header">
          <h2>Cerca il tuo rivenditore</h2>
          <button className="search-close-btn" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filtri */}
        <div className="search-filters">
          <div className="search-filter-row">
            <div className="search-filter-group">
              <label htmlFor="nome">Cerca per nome dell'azienda</label>
              <input
                type="text"
                id="nome"
                value={filters.nome}
                onChange={(e) => handleFilterChange("nome", e.target.value)}
                placeholder="Cerca per azienda..."
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          <div className="search-filter-row search-filter-row-inline">
            <div className="search-filter-group">
              <label htmlFor="settore">Per settore</label>
              <select
                id="settore"
                value={filters.settore}
                onChange={(e) => handleFilterChange("settore", e.target.value)}
              >
                <option value="">Tutti i settori</option>
                {settori.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-filter-group">
              <label htmlFor="tipologia">Per Tipologia Servizi</label>
              <select
                id="tipologia"
                value={filters.tipologia}
                onChange={(e) =>
                  handleFilterChange("tipologia", e.target.value)
                }
              >
                <option value="">Tutte le tipologie</option>
                {tipologie.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-buttons">
            <button className="search-submit-btn" onClick={handleSearch}>
              Cerca
            </button>
            <button className="search-reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {/* Risultati */}
        <div
          className={`search-results ${searchResults !== null ? "search-results-visible" : ""}`}
        >
          {searchResults === null ? (
            <div className="search-no-results">
              Digita il nome di un'azienda per vedere i risultati
            </div>
          ) : (
            <>
              <div className="search-results-header">
                <div className="search-results-title-wrap">
                  <span className="search-results-title">
                    Risultati di ricerca {searchResults.length}
                  </span>
                  <span className="search-results-separator"> --- </span>
                  <span className="search-results-hint">
                    Scorri per scoprire altre aziende
                  </span>
                </div>
              </div>
              <div className="search-results-list">
                {searchResults.map(({ vendor, poi }, i) => (
                  <SearchResultCard
                    key={`${poi.id}-${i}`}
                    vendor={vendor}
                    poi={poi}
                    onSelect={handleSelect}
                  />
                ))}
                {searchResults.length === 0 && (
                  <div className="search-no-results">
                    Nessun edificio trovato con i filtri selezionati
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
