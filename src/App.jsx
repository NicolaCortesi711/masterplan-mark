import { useState, useRef, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, Preload } from "@react-three/drei";
import Land from "./Components/Land";
import WelcomeOverlay from "./Components/WelcomeOverlay";
import FocusOverlay from "./Components/ComponentOverlay";
import { useBuildings } from "./contexts/BuildingsContext";
import CustomLoader from "./Components/CustomLoader";
import HoverTooltip from "./Components/HoverTooltip";
import CustomCursor from "./Components/CustomCursor";
import SearchButton from "./Components/SearchButton";
import SearchOverlay from "./Components/SearchOverlay";
import Chatbot from "./Components/Chatbot";
import SkyboxCube from "./Components/SkyboxCube";
import Compass from "./Components/Compass";
import CompassTick from "./Components/CompassTick";

const MIN_CAMERA_Y = 3.5;

export default function App() {
  const POIS = useBuildings();
  const [started, setStarted] = useState(false);
  const [gpuReady, setGpuReady] = useState(false);
  const compassImgRef = useRef();
  const [isFocusActive, setIsFocusActive] = useState(false);
  const isLowEndRef = useRef(false);
  const [focusedPOI, setFocusedPOI] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFocusPOI, setSearchFocusPOI] = useState(null);
  const [focusedVendor, setFocusedVendor] = useState(null);
  const cameraRef = useRef();
  const controlsRef = useRef();
  const tooltipRef = useRef();
  const isDraggingRef = useRef(false); // FIX 4: ref invece di useState
  const wrapperRef = useRef(); // FIX 4: cursore via DOM diretto

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const enforceMinHeight = () => {
      const cam = cameraRef.current;
      if (cam && cam.position.y < MIN_CAMERA_Y) {
        cam.position.y = MIN_CAMERA_Y;
      }
    };
    controls.addEventListener("change", enforceMinHeight);
    return () => controls.removeEventListener("change", enforceMinHeight);
  }, [started]);

  const activePOI = useMemo(
    () => POIS.find((p) => p.stand === focusedPOI),
    [POIS, focusedPOI],
  );

  return (
    <>
      {!started && (
        <WelcomeOverlay
          cameraRef={cameraRef}
          controlsRef={controlsRef}
          onStart={() => setStarted(true)}
        />
      )}

      <div
        ref={wrapperRef}
        style={{
          cursor: isFocusActive ? "default" : "grab",
          width: "100%",
          height: "100%",
        }}
        onMouseDown={() => {
          if (!isFocusActive) {
            isDraggingRef.current = true;
            tooltipRef.current?.hide();
            if (wrapperRef.current)
              wrapperRef.current.style.cursor = "grabbing";
          }
        }}
        onMouseUp={() => {
          isDraggingRef.current = false;
          if (wrapperRef.current)
            wrapperRef.current.style.cursor = isFocusActive
              ? "default"
              : "grab";
        }}
      >
        <Canvas
          shadows
          frameloop="always"
          dpr={[1, 1]}
          camera={{
            position: [0, 0, 0],
            fov: 35,
            near: 1,
            far: 200,
          }}
          onCreated={({ camera, gl }) => {
            cameraRef.current = camera;
            const ctx = gl.getContext();
            const ext = ctx.getExtension("WEBGL_debug_renderer_info");
            const renderer = ext
              ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)
              : ctx.getParameter(ctx.RENDERER);
            isLowEndRef.current = /Intel|Iris|UHD|HD Graphics/i.test(renderer ?? "");
            if (isLowEndRef.current) {
              gl.setPixelRatio(1);
            } else {
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            }
            console.log(`[GPU] renderer: "${renderer}" → isLowEnd: ${isLowEndRef.current}`);
            console.log(`[DEVICE] screen: ${screen.width}x${screen.height} | DPR: ${window.devicePixelRatio} | UA: ${navigator.userAgent}`);
            setGpuReady(true);
          }}
        >
          <SkyboxCube />
          <MapControls
            makeDefault
            ref={(ref) => {
              controlsRef.current = ref || undefined;
            }}
            enabled={!isFocusActive}
            enableDamping
            dampingFactor={0.05}
            minDistance={15}
            maxDistance={50}
            minPolarAngle={Math.PI / 7.1}
            maxPolarAngle={Math.PI / 2.4}
            screenSpacePanning={false}
          />
          {gpuReady && (
            <Land
              isFocusActive={isFocusActive}
              onFocusEnter={(name) => {
                setFocusedPOI(name);
                setIsFocusActive(true);
                tooltipRef.current?.hide();
              }}
              onFocusExit={() => {
                setIsFocusActive(false);
              }}
              onHoverChange={(data, x, y) => {
                if (!data) {
                  tooltipRef.current?.hide();
                } else {
                  tooltipRef.current?.show(data, x, y);
                }
              }}
              searchFocusPOI={searchFocusPOI}
              isDraggingRef={isDraggingRef}
              isLowEnd={isLowEndRef.current}
            />
          )}
          <CompassTick imgRef={compassImgRef} />
          <Preload all />
        </Canvas>
        {gpuReady && !isFocusActive && !isSearchOpen && (
          <Compass ref={compassImgRef} cameraRef={cameraRef} controlsRef={controlsRef} />
        )}
      </div>

      <FocusOverlay
        active={isFocusActive}
        poi={activePOI}
        focusedVendor={focusedVendor}
        onClose={() => {
          setIsFocusActive(false);
          setSearchFocusPOI(null);
          setFocusedVendor(null);
        }}
      />
      <HoverTooltip ref={tooltipRef} />
      {started && !isFocusActive && (
        <SearchButton onClick={() => setIsSearchOpen(true)} />
      )}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectBuilding={(poi, vendor = null) => {
          setFocusedPOI(poi.stand);
          setIsFocusActive(true);
          setSearchFocusPOI(poi);
          setFocusedVendor(vendor);
        }}
      />

      <CustomLoader />
      <CustomCursor />
      {started && !isSearchOpen && <Chatbot />}
    </>
  );
}
