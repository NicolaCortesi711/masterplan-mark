import { useRef } from "react";

/**
 * Hook per distinguere tra click e drag del mouse
 * @param {number} threshold - distanza minima in px per considerare un drag (default: 5)
 * @returns {object} - metodi da associare a pointerDown / pointerUp
 */
export function useClickDrag(threshold = 5) {
  const start = useRef({ x: 0, y: 0 });

  const onPointerDown = (e) => {
    start.current = { x: e.clientX, y: e.clientY };
  };

  const isClick = (e) => {
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= threshold;
  };

  return { onPointerDown, isClick };
}
