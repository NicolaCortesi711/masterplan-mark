import { createContext, useContext, useState, useEffect } from "react";
import fallbackData from "../data/buildings.json";
import { API_KEY, ENDPOINTS } from "../config";

const BuildingsContext = createContext(fallbackData);

export function BuildingsProvider({ children }) {
  const [buildings, setBuildings] = useState(fallbackData);

  useEffect(() => {
    fetch(ENDPOINTS.buildings, {
      method: "GET",
      headers: { "X-API-Key": API_KEY },
    })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => setBuildings(data))
      .catch(() => {}); // mantiene fallback locale in caso di errore
  }, []);

  return (
    <BuildingsContext.Provider value={buildings}>
      {children}
    </BuildingsContext.Provider>
  );
}

export const useBuildings = () => useContext(BuildingsContext);
