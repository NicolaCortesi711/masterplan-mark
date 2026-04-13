import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";

const INTERVAL_MS = 5000;

export default function PerformanceLogger() {
  const { gl } = useThree();

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const minFps = useRef(Infinity);
  const maxFps = useRef(0);
  const frameTimes = useRef([]);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    const instantFps = 1000 / delta;

    frameTimes.current.push(delta);
    if (instantFps < minFps.current) minFps.current = instantFps;
    if (instantFps > maxFps.current) maxFps.current = instantFps;

    frameCount.current++;
    lastTime.current = now;

    if (frameCount.current % Math.round(INTERVAL_MS / 20) === 0) {
      const avgFps =
        frameTimes.current.length > 0
          ? 1000 /
            (frameTimes.current.reduce((a, b) => a + b, 0) /
              frameTimes.current.length)
          : 0;

      const info = gl.info;
      const mem = (performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1);

      console.groupCollapsed(
        `%c[PERF REPORT] FPS avg:${avgFps.toFixed(1)} min:${minFps.current.toFixed(1)} max:${maxFps.current.toFixed(1)}`,
        "color: #00cc66; font-weight: bold;"
      );
      console.log("FPS         avg:", avgFps.toFixed(1), "| min:", minFps.current.toFixed(1), "| max:", maxFps.current.toFixed(1));
      console.log("Draw calls :", info.render.calls);
      console.log("Triangles  :", info.render.triangles.toLocaleString());
      console.log("Geometries :", info.memory.geometries);
      console.log("Textures   :", info.memory.textures);
      console.log("JS Heap    :", mem !== "NaN" ? `${mem} MB` : "n/d (solo Chrome)");
      console.log("DPR        :", gl.getPixelRatio());
      console.groupEnd();

      // reset
      frameCount.current = 0;
      minFps.current = Infinity;
      maxFps.current = 0;
      frameTimes.current = [];
    }
  });

  return null;
}
