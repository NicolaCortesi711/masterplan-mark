// src/Components/usePOI.js
import { useMemo } from "react";
import * as THREE from "three";

export function usePOI(scene, poiConfig) {
  return useMemo(() => {
    if (!scene || !scene.traverse) return [];

    const found = [];
    const sanitize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const lowerName = sanitize(child.name);
        const parentLowerName = sanitize(child.parent?.name || "");
        for (const poi of poiConfig) {
          const poiKey = sanitize(poi.id);
          if (lowerName === poiKey || parentLowerName === poiKey) {
            // Clona il materiale per sicurezza
            child.material = child.material.clone();
            found.push({ mesh: child, poi });
          }
        }
      }
    });

    return found;
  }, [scene, poiConfig, scene.uuid]); // aggiunto scene.uuid per rigenerare al mount
}
