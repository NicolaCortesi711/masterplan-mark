import { useEffect, useRef, memo } from 'react'
import './CustomCursor.css'

export default memo(function CustomCursor() {
  const cursorRef = useRef(null)
  const poiHovered = useRef(false)
  const prevHovered = useRef(false)

  useEffect(() => {
    const move = (e) => {
      if (!cursorRef.current) return
      cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      if (!poiHovered.current) {
        const next = !!e.target.closest('a, button, [data-cursor-hover]')
        if (next !== prevHovered.current) {
          prevHovered.current = next
          cursorRef.current.classList.toggle('hovered', next)
        }
      }
    }

    const onPoiHover = (e) => {
      poiHovered.current = e.detail.active
      cursorRef.current?.classList.toggle('hovered', e.detail.active)
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('cursor-poi-hover', onPoiHover)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('cursor-poi-hover', onPoiHover)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
    />
  )
})
