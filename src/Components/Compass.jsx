import { forwardRef } from "react";
import { resetCamera } from "./CameraUtils";

/**
 * Immagine della bussola renderizzata fuori dal Canvas.
 * La rotazione viene aggiornata da CompassTick (dentro il Canvas via useFrame).
 * Il click resetta la camera alla posizione iniziale.
 */
const Compass = forwardRef(function Compass({ cameraRef, controlsRef }, imgRef) {
  return (
    <img
      ref={imgRef}
      src="compass.webp"
      onClick={() => resetCamera(cameraRef?.current, controlsRef?.current)}
      style={{
        position: "fixed",
        top: "80px",
        right: "29px",
        width: "30px",
        height: "30px",
        cursor: "pointer",
        pointerEvents: "auto",
        zIndex: 9999,
      }}
    />
  );
});

export default Compass;
