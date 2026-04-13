import { Environment } from "@react-three/drei";
import { SoftShadows } from "@react-three/drei";

export default function EnvironmentLights() {
  return (
    <>
      {/* Luce direzionale reale (per le ombre fisiche) */}
      <directionalLight
        position={[60, 40, 40]}
        intensity={3}
        color="#fff7e3"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={30}
        shadow-camera-far={400}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.0001}
        shadow-normalBias={0.3}
      />

      <directionalLight
        position={[-60, 40, -40]}
        intensity={0.4}
        color="#97c8ff"
        castShadow={false}
      />

      <ambientLight intensity={0.7} color="#cdf9ff" />
      <SoftShadows size={9} samples={11} focus={0.3} />

      {/* Ambiente visivo e riflessi globali */}
      {/* <Environment preset="forest" environmentIntensity={0.25} /> */}
    </>
  );
}
