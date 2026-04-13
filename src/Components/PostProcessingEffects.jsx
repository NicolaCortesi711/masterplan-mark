import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector2 } from "three";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  SMAAEffect,
  BloomEffect,
  VignetteEffect,
  ToneMappingEffect,
  ToneMappingMode,
  BrightnessContrastEffect,
  HueSaturationEffect,
} from "postprocessing";
import { N8AOPostPass } from "n8ao";

export default function PostProcessingEffects({ isLowEnd = false }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef();

  useEffect(() => {
    const composer = new EffectComposer(gl);

    composer.addPass(new RenderPass(scene, camera));

    if (!isLowEnd) {
      const { x: width, y: height } = gl.getSize(new Vector2());
      const n8aoPass = new N8AOPostPass(scene, camera, width, height);
      n8aoPass.configuration.aoRadius = 2;
      n8aoPass.configuration.intensity = 1.5;
      n8aoPass.configuration.distanceFalloff = 0.5;
      n8aoPass.configuration.aoSamples = 8;
      n8aoPass.configuration.halfRes = true;
      composer.addPass(n8aoPass);
    }

    composer.addPass(
      isLowEnd
        ? new EffectPass(
            camera,
            new SMAAEffect(),
            new BrightnessContrastEffect({ brightness: 0.07, contrast: 0.1 }),
            new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }),
          )
        : new EffectPass(
            camera,
            new SMAAEffect(),
            new BloomEffect({
              luminanceThreshold: 0.2,
              luminanceSmoothing: 5,
              intensity: 0.15,
              mipmapBlur: true,
            }),
            new BrightnessContrastEffect({ brightness: 0.07, contrast: 0.1 }),
            new HueSaturationEffect({ saturation: 0.15 }),
            new VignetteEffect({ offset: 0.3, darkness: 0.7 }),
            new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }),
          ),
    );

    const { x: w, y: h } = gl.getSize(new Vector2());
    composer.setSize(w, h);
    composerRef.current = composer;

    return () => composer.dispose();
  }, [gl, scene, camera, isLowEnd]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    composerRef.current?.render();
  }, 1);

  return null;
}
