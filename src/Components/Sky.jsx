import { useRef } from "react";
import { Clouds, Cloud } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Sky() {
  const ref = useRef();
  const cloud0 = useRef();

  const config = {
    segments: 40,
    volume: 20,
    opacity: 0.9,
    fade: 10,
    growth: 4,
    speed: 0.1,
  };

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.085) / 10;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime / 2) / 20;
    }
    if (cloud0.current) {
      cloud0.current.rotation.y -= delta * 0.03;
    }
  });

  return (
    <group ref={ref} position={[0, 11.5, 0]} scale={[1, 0.9, 1.4]}>
      <Clouds material={THREE.MeshBasicMaterial} limit={100} range={100}>
        <Cloud
          ref={cloud0}
          {...config}
          bounds={[15, 2, 15]}
          color="#ffffff"
          seed={1}
        />
        <Cloud {...config} bounds={[15, 2, 15]} color="#ffffff" seed={2} />
        <Cloud {...config} bounds={[15, 2, 15]} color="#e8f0e8" seed={3} />
        <Cloud {...config} bounds={[15, 2, 15]} color="#ffffff" seed={4} />
      </Clouds>
    </group>
  );
}
