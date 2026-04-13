import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { resetCamera } from "./CameraUtils";

export default function WelcomeOverlay({ cameraRef, controlsRef, onStart }) {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef(null);
  const buttonRef = useRef(null);
  const titleRef = useRef(null);
  const orbitAnimRef = useRef(null);

  useEffect(() => {
    // 🎬 Fade-in iniziale
    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power2.out" },
      );
    }

    // 🎬 Titolo: fade + slide dal basso
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: "power2.out" },
      );
    }

    // ✅ Posizione iniziale della camera — differita di un frame per attendere R3F
    const rafId = requestAnimationFrame(() => {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls) return;

      camera.position.set(31.46, 15.48, -0.75);
      controls.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
      controls.update();

      // 🎥 Lenta orbita verso sinistra
      const radius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      const proxy = {
        angle: Math.atan2(camera.position.z, camera.position.x),
      };
      orbitAnimRef.current = gsap.to(proxy, {
        angle: proxy.angle - Math.PI * 0.4,
        duration: 40,
        ease: "none",
        onUpdate: () => {
          camera.position.x = Math.cos(proxy.angle) * radius;
          camera.position.z = Math.sin(proxy.angle) * radius;
          controls.update();
        },
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      orbitAnimRef.current?.kill();
    };
  }, []);

  const handleHover = () => {
    gsap.to(buttonRef.current, {
      scale: 1.08,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handlePress = () => {
    gsap.fromTo(
      buttonRef.current,
      { scale: 1.08 },
      {
        scale: 0.95,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      },
    );
  };

  const handleExplore = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    orbitAnimRef.current?.kill();

    resetCamera(camera, controls, [-3.02, 31.26, 47.29], [-3.02, 0, 8.27], () => {
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            setVisible(false);
            onStart?.();
          },
        });
      }
    });
  };

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "white",
        zIndex: 10000,
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
        opacity: 0, // parte invisibile (fade-in automatico)
        marginTop: "-150px",
      }}
    >
      <div style={{ perspective: 800 }}>
        <img
          src={import.meta.env.BASE_URL + "logo-car.png"}
          alt=""
          style={{ width: "60px", height: "60px" }}
        />
      </div>
      <h1
        ref={titleRef}
        style={{
          fontSize: "64px",
          marginBottom: "-10px",
          letterSpacing: "1px",
          fontWeight: 600,
          opacity: 0,
          textTransform: "uppercase",
        }}
      >
        Mappa del CAR
      </h1>
      <p
        style={{
          fontSize: "32px",
          fontWeight: 200,
          margin: 0,
          padding: "20px",
        }}
      >
        Centro Agroalimentare di Roma
      </p>
      <button
        ref={buttonRef}
        onClick={() => {
          handlePress();
          handleExplore();
        }}
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        style={{
          padding: "12px 52px",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#fff",
          fontWeight: 200,
          border: "1px solid #fff",
          borderRadius: "50px",
          cursor: "pointer",
          fontSize: "1.2rem",
          marginTop: "30px",
        }}
      >
        Esplora
      </button>
      <p
        style={{
          position: "fixed",
          bottom: "50px",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "20px",
          fontWeight: 300,
          color: "white",
          letterSpacing: "0.05em",
          margin: 0,
        }}
      >
        Esplora la mappa e fai click sugli edifici
      </p>
    </div>
  );
}
