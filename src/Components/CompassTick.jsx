import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const dir = new THREE.Vector3();

/**
 * Componente nullo dentro il Canvas.
 * Usa useFrame per aggiornare la rotazione della bussola ad ogni frame
 * senza re-render React, scrivendo direttamente sul DOM via imgRef.
 */
export default function CompassTick({ imgRef }) {
  useFrame(({ camera }) => {
    if (!imgRef?.current) return;
    camera.getWorldDirection(dir);
    const yaw = Math.atan2(dir.x, dir.z);
    imgRef.current.style.transform = `rotate(${-(yaw + Math.PI)}rad)`;
  });
  return null;
}
