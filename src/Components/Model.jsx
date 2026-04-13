import React, { useState, useEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBuildings } from "../contexts/BuildingsContext";
import { usePOI } from "./UsePOI";
import { moveCameraToObject, resetCamera } from "./CameraUtils";
import { useClickDrag } from "./UseClickDrag";

useGLTF.preload(import.meta.env.BASE_URL + "masterplan-test-2.glb");

export default function Model({
  onFocusEnter,
  onFocusExit,
  isFocusActive,
  onHoverChange,
  searchFocusPOI,
  isDraggingRef,
}) {
  const POIS = useBuildings();
  const { scene } = useGLTF(import.meta.env.BASE_URL + "masterplan-test-2.glb");
  const { camera, controls } = useThree();
  const [focused, setFocused] = useState(null);

  const prevCamera = useRef({
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
  });

  const { onPointerDown, isClick } = useClickDrag(5);

  const poiMeshes = usePOI(scene, POIS);

  // Selezione delle mesh da evidenziare all'hover: quelle con nome/path "Plane002_1"
  const targetMeshesRef = useRef(new Set());

  useEffect(() => {
    if (!scene) return;
    const set = new Set();

    const getPath = (obj) => {
      const names = [];
      let cur = obj;
      while (cur) {
        if (cur.name) names.unshift(cur.name);
        cur = cur.parent;
      }
      return names.join("/");
    };

    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const path = getPath(obj);
      const match = obj.name === "Plane002_1" || /\/Plane002_1$/.test(path);
      if (match) {
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map((m) => (m?.clone ? m.clone() : m));
        } else if (obj.material?.clone) {
          obj.material = obj.material.clone();
        }
        set.add(obj);
      }
    });

    targetMeshesRef.current = set;
  }, [scene]);

  // FIX 1: Map precalcolata poi.id → mesh[], evita scene.traverse() ad ogni hover
  // usePOI (useMemo) ha già clonato i materiali di queste mesh — FIX 5 rimuove il useEffect ridondante
  const poiMeshMap = useMemo(() => {
    const map = new Map();
    for (const { mesh, poi } of poiMeshes) {
      if (!map.has(poi.id)) map.set(poi.id, []);
      map.get(poi.id).push(mesh);
    }
    return map;
  }, [poiMeshes]);

  // 🔍 Trova il POI a cui appartiene questa mesh (basato sul nome o parent)
  const findPOIForMesh = (obj) => {
    if (!obj.name) return null;
    const meshName = obj.name;
    const parentName = obj.parent?.name;

    if (parentName) {
      const byParent = POIS.find((poi) => parentName === poi.id);
      if (byParent) return byParent;
    }

    return POIS.find((poi) => meshName === poi.id);
  };

  // FIX 1: lookup O(1) invece di scene.traverse() ad ogni hover
  const getMeshesForPOI = (poi) => poiMeshMap.get(poi.id) ?? [];

  // 🎨 Applica highlight a tutte le mesh di un POI
  const applyHighlightToPOI = (poi, highlight = true) => {
    const meshes = getMeshesForPOI(poi);

    const snapshot = (m) =>
      m
        ? {
            color: m.color?.clone?.(),
            emissive: m.emissive?.clone?.(),
            emissiveIntensity: m.emissiveIntensity,
          }
        : null;

    const applyHighlight = (m) => {
      if (!m) return;
      if (m.emissive !== undefined) {
        m.emissive = new THREE.Color("#ffb347");
        m.emissiveIntensity = 0.6;
        m.needsUpdate = true;
      } else if (m.color) {
        m.color.set("#ffb347");
        m.needsUpdate = true;
      }
    };

    const restore = (m, o) => {
      if (!m || !o) return;
      if (m.emissive !== undefined && o.emissive) {
        m.emissive.copy(o.emissive);
      } else if (m.emissive !== undefined) {
        m.emissive = new THREE.Color(0x000000);
      }
      if (m.color && o.color) m.color.copy(o.color);
      if (typeof o.emissiveIntensity === "number") {
        m.emissiveIntensity = o.emissiveIntensity;
      } else {
        m.emissiveIntensity = 0;
      }
      m.needsUpdate = true;
    };

    meshes.forEach((child) => {
      if (highlight) {
        if (!child.userData.__hoverOrig) {
          if (Array.isArray(child.material)) {
            child.userData.__hoverOrig = child.material.map(snapshot);
          } else {
            child.userData.__hoverOrig = snapshot(child.material);
          }
        }
        if (Array.isArray(child.material))
          child.material.forEach(applyHighlight);
        else applyHighlight(child.material);
      } else {
        const orig = child.userData.__hoverOrig;
        if (orig) {
          if (Array.isArray(child.material) && Array.isArray(orig)) {
            child.material.forEach((m, i) => restore(m, orig[i]));
          } else if (!Array.isArray(child.material) && !Array.isArray(orig)) {
            restore(child.material, orig);
          }
          delete child.userData.__hoverOrig;
        }
      }
    });
  };

  const hoveredPOIRef = useRef(null);
  const selectedPOIRef = useRef(null);

  // Rimuove l'highlight solo se il POI non è quello selezionato (clicked)
  const removeHighlightIfNotSelected = (poi) => {
    if (poi && selectedPOIRef.current?.id !== poi.id) {
      applyHighlightToPOI(poi, false);
    }
  };

  // 🖱️ Hover highlight
  const handlePointerOver = (e) => {
    if (isFocusActive || isDraggingRef?.current) {
      if (hoveredPOIRef.current) {
        removeHighlightIfNotSelected(hoveredPOIRef.current);
        hoveredPOIRef.current = null;
        onHoverChange?.(null, 0, 0);
      }
      return;
    }
    const obj = e.object;

    const poi = findPOIForMesh(obj);

    if (!poi) {
      if (hoveredPOIRef.current) {
        removeHighlightIfNotSelected(hoveredPOIRef.current);
        hoveredPOIRef.current = null;
        document.body.style.cursor = "default";
        window.dispatchEvent(
          new CustomEvent("cursor-poi-hover", { detail: { active: false } }),
        );
        onHoverChange?.(null, 0, 0);
      }
      return;
    }

    e.stopPropagation();
    document.body.style.cursor = "pointer";
    window.dispatchEvent(
      new CustomEvent("cursor-poi-hover", { detail: { active: true } }),
    );

    const clientX = e.nativeEvent?.clientX ?? e.clientX ?? 0;
    const clientY = e.nativeEvent?.clientY ?? e.clientY ?? 0;
    const meshId = e.object?.name ?? e.object?.parent?.name;
    const matchedVendor =
      poi.venditori?.find((v) => v.stand === meshId || poi.id === meshId) ??
      poi.venditori?.[0];

    if (hoveredPOIRef.current?.id === poi.id) {
      onHoverChange?.({ poi, vendor: matchedVendor }, clientX, clientY);
      return;
    }

    if (hoveredPOIRef.current) {
      removeHighlightIfNotSelected(hoveredPOIRef.current);
    }

    hoveredPOIRef.current = poi;
    applyHighlightToPOI(poi, true);
    onHoverChange?.({ poi, vendor: matchedVendor }, clientX, clientY);
  };

  // 🖱️ Click POI → solo se non è un drag
  const handlePointerUp = (e) => {
    if (isFocusActive) return;

    if (!isClick(e)) return;

    const poiData = poiMeshes.find((p) => p.mesh === e.object);
    if (!poiData) return;

    e.stopPropagation();

    // Rimuovi highlight dal precedente selected (se diverso da quello cliccato)
    if (
      selectedPOIRef.current &&
      selectedPOIRef.current.id !== poiData.poi.id
    ) {
      if (hoveredPOIRef.current?.id !== selectedPOIRef.current.id) {
        applyHighlightToPOI(selectedPOIRef.current, false);
      }
    }

    selectedPOIRef.current = poiData.poi;
    applyHighlightToPOI(poiData.poi, true);

    setFocused(poiData.poi.stand);
    onFocusEnter?.(poiData.poi.stand);

    prevCamera.current.position.copy(camera.position);
    if (controls?.target) {
      prevCamera.current.target.copy(controls.target);
    }

    moveCameraToObject(camera, controls, poiData.mesh, {
      customPosition: poiData.poi.cameraPosition,
      customTarget: poiData.poi.lookAt,
    });
  };

  // 🔁 Uscita dal focus → torna dove eri e deseleziona
  useEffect(() => {
    if (!isFocusActive && focused) {
      if (selectedPOIRef.current) {
        applyHighlightToPOI(selectedPOIRef.current, false);
        selectedPOIRef.current = null;
      }
      resetCamera(
        camera,
        controls,
        prevCamera.current.position.toArray(),
        prevCamera.current.target.toArray(),
      );
      setFocused(null);
      onFocusExit?.();
    }
  }, [isFocusActive]);

  // 🔍 Focus da ricerca
  useEffect(() => {
    if (!searchFocusPOI || !scene) return;

    const poi = POIS.find(
      (p) => p.id === searchFocusPOI.id || p.stand === searchFocusPOI.stand,
    );
    if (!poi) return;

    const poiData = poiMeshes.find((p) => p.poi.id === poi.id);
    if (!poiData) return;

    prevCamera.current.position.copy(camera.position);
    if (controls?.target) {
      prevCamera.current.target.copy(controls.target);
    }

    // Rimuovi highlight dal precedente selected
    if (selectedPOIRef.current && selectedPOIRef.current.id !== poi.id) {
      applyHighlightToPOI(selectedPOIRef.current, false);
    }
    selectedPOIRef.current = poi;
    applyHighlightToPOI(poi, true);

    setFocused(poi.stand);

    moveCameraToObject(camera, controls, poiData.mesh, {
      customPosition: poi.cameraPosition,
      customTarget: poi.lookAt,
    });
  }, [searchFocusPOI, scene, poiMeshes]);

  return (
    <primitive
      object={scene}
      onPointerMove={handlePointerOver}
      onPointerLeave={() => {
        if (hoveredPOIRef.current) {
          removeHighlightIfNotSelected(hoveredPOIRef.current);
          hoveredPOIRef.current = null;
          document.body.style.cursor = "default";
          window.dispatchEvent(
            new CustomEvent("cursor-poi-hover", { detail: { active: false } }),
          );
          onHoverChange?.(null, 0, 0);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerUp={handlePointerUp}
    />
  );
}
