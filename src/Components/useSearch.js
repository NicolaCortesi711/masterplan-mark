import { useState, useMemo, useEffect } from "react";
import { useBuildings } from "../contexts/BuildingsContext";

/**
 * Stato iniziale dei filtri — definito fuori dal hook per evitare
 * di ricreare l'oggetto ad ogni render e per usarlo anche in handleReset.
 */
const EMPTY_FILTERS = { nome: "", settore: "", tipologia: "" };

/**
 * Rimuove duplicati dall'array di risultati confrontando
 * nome_azienda + settore + tipologia.
 * Tiene la prima occorrenza, utile quando la stessa azienda
 * compare in più POI con id diversi.
 */
function dedup(results) {
  return results.filter(
    (item, index, arr) =>
      arr.findIndex(
        (x) =>
          x.vendor.nome_azienda === item.vendor.nome_azienda &&
          x.poi.settore === item.poi.settore &&
          x.vendor.tipologia === item.vendor.tipologia,
      ) === index,
  );
}

/**
 * Funzione pura che verifica se un vendor/poi supera i filtri attivi.
 * Il filtro nome cerca per iniziale di parola (es. "fer" trova "Ferrini").
 * I filtri settore e tipologia richiedono corrispondenza esatta.
 */
function matchesFilters(vendor, poi, filters) {
  const parts = filters.nome.toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length > 0) {
    const words = vendor.nome_azienda?.toLowerCase().split(/\s+/) ?? [];
    if (!parts.every((part) => words.some((word) => word.startsWith(part))))
      return false;
  }
  if (filters.settore && poi.settore !== filters.settore) return false;
  if (filters.tipologia && vendor.tipologia !== filters.tipologia) return false;
  return true;
}

/**
 * Costruisce l'array di risultati { vendor, poi } a partire da tutti i POI,
 * applicando i filtri e deduplicando il risultato finale.
 */
function buildResults(pois, filters) {
  return dedup(
    pois.flatMap((poi) =>
      (poi.venditori ?? [])
        .filter((v) => matchesFilters(v, poi, filters))
        .map((v) => ({ vendor: v, poi })),
    ),
  );
}

/**
 * Hook che gestisce tutto lo stato e la logica della ricerca.
 *
 * Comportamento della ricerca live (useEffect):
 * - se nome è vuoto e nessun altro filtro è attivo → azzera i risultati
 * - se nome è vuoto ma settore/tipologia sono attivi → mantiene i risultati esistenti
 *   (l'utente ha già cercato via bottone e sta solo navigando i dropdown)
 * - se nome è valorizzato → aggiorna i risultati in tempo reale
 *
 * La ricerca via bottone funziona con qualsiasi combinazione di filtri non vuoti.
 *
 * @returns {object} filters, searchResults, settori, tipologie, handlers
 */
export function useSearch() {
  const POIS = useBuildings();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchResults, setSearchResults] = useState(null);

  // Valori unici per i dropdown — ricalcolati solo se cambia la lista POI
  const settori = useMemo(
    () => [...new Set(POIS.map((p) => p.settore).filter(Boolean))],
    [POIS],
  );

  const tipologie = useMemo(
    () => [
      ...new Set(
        POIS.flatMap((p) => p.venditori?.map((v) => v.tipologia) ?? []).filter(
          Boolean,
        ),
      ),
    ],
    [POIS],
  );

  // Ricerca live: si attiva quando si digita il nome
  // Se nome è vuoto ma altri filtri sono attivi, mantiene i risultati esistenti
  useEffect(() => {
    const hasNome = filters.nome.trim().length > 0;
    if (!hasNome) {
      if (!filters.settore && !filters.tipologia) setSearchResults(null);
      return;
    }
    setSearchResults(buildResults(POIS, filters));
  }, [filters, POIS]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Ricerca manuale via bottone — almeno un filtro deve essere valorizzato
  const handleSearch = () => {
    if (!filters.nome && !filters.settore && !filters.tipologia) return;
    setSearchResults(buildResults(POIS, filters));
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setSearchResults(null);
  };

  return {
    filters,
    searchResults,
    settori,
    tipologie,
    handleFilterChange,
    handleSearch,
    handleReset,
  };
}
