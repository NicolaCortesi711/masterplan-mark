import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CubeTextureLoader } from "three";

export default function SkyboxCube() {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new CubeTextureLoader();

    const texture = loader.load([
      "skybox/px.png",
      "skybox/nx.png",
      "skybox/py.png",
      "skybox/ny.png",
      "skybox/pz.png",
      "skybox/nz.png",
    ]);

    scene.background = texture;
  }, [scene]);

  return null;
}