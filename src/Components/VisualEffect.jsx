// import {
//   EffectComposer,
//   DepthOfField,
//   Bloom,
//   SSAO,
//   Vignette,
// } from "@react-three/postprocessing";

// export default function VisualEffect() {
//   return (
//     <EffectComposer enableNormalPass>
//       {" "}
//       {/* 👈 AGGIUNGI QUESTO */}
//       <DepthOfField focusDistance={0.005} focalLength={0.02} bokehScale={1} />
//       <Bloom
//         luminanceThreshold={0.5}
//         luminanceSmoothing={0.9}
//         height={300}
//         opacity={0.05}
//       />
//       /
//       {/* <SSAO samples={31} radius={2} intensity={1} luminanceInfluence={0.6} /> */}
//       <Vignette eskil={false} offset={0.05} darkness={0.6} />
//     </EffectComposer>
//   );
// }
