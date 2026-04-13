import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import Model from "./Model";
import EnvironmentLights from "./EnvironmentLights";
import Sky from "./Sky";
import Particles from "./Particles";
import PostProcessingEffects from "./PostProcessingEffects";

export default function Land({
  onFocusEnter,
  onFocusExit,
  isFocusActive = false,
  onHoverChange,
  searchFocusPOI,
  isDraggingRef,
  isLowEnd = false,
}) {
  const { scene, gl, camera, controls } = useThree();

  // Impostazioni generali della scena
  useEffect(() => {
    gl.shadowMap.enabled = !isLowEnd;
    gl.shadowMap.type = isLowEnd ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.NoToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;

    scene.fog = new THREE.Fog("#b5dee4", 70, 200);
    //scene.background = new THREE.Color("#abddff");

    camera.position.set(-3.36, 17.56, 42.86);
    camera.lookAt(0, 0, 0);
  }, [scene, gl, camera, isLowEnd]);

  // Pre-clamp bounds: intercetta il change dei controls prima del render
  // così il frame renderizzato mostra già la posizione clampata, senza lag
  useEffect(() => {
    if (!controls) return;
    const BOUNDS = { minX: -32, maxX: 32, minZ: -32, maxZ: 32 };
    const clampBounds = () => {
      const tx = Math.max(
        BOUNDS.minX,
        Math.min(BOUNDS.maxX, controls.target.x),
      );
      const tz = Math.max(
        BOUNDS.minZ,
        Math.min(BOUNDS.maxZ, controls.target.z),
      );
      if (tx !== controls.target.x || tz !== controls.target.z) {
        const dx = tx - controls.target.x;
        const dz = tz - controls.target.z;
        controls.target.x = tx;
        controls.target.z = tz;
        camera.position.x += dx;
        camera.position.z += dz;
      }
    };
    controls.addEventListener("change", clampBounds);
    return () => controls.removeEventListener("change", clampBounds);
  }, [controls, camera]);

  return (
    <>
      {/*  Luci ambiente */}
      <EnvironmentLights />
      {/*  Modello 3D principale */}
      <Model
        onFocusEnter={onFocusEnter}
        onFocusExit={onFocusExit}
        isFocusActive={isFocusActive}
        onHoverChange={onHoverChange}
        searchFocusPOI={searchFocusPOI}
        isDraggingRef={isDraggingRef}
      />
      {/* ☁️ Cielo e particelle */}
      {/* <Sky /> */}
      <Particles />
      {/* 🎞️ Effetti post-processing */}
      <PostProcessingEffects isLowEnd={isLowEnd} />
      {/*Piano per ricevere ombre */}/
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0]}>
        <circleGeometry args={[100, 64]} />
        <meshStandardMaterial color="#6b8868" />
      </mesh>
      {/* 🎮 Controlli camera gestiti in App.jsx */}
    </>
  );
}
