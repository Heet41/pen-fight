import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only enable the custom cursor for mouse/trackpad devices.
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animationFrame = 0;

    const updateCursor = () => {
      // Small dot follows the pointer immediately.
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Ring follows with a slight delay for a smoother effect.
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animationFrame = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      const target = event.target as HTMLElement | null;

      setIsHovering(
        !!target?.closest(
          'button, a, input, select, textarea, [role="button"]'
        )
      );
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleClick = (event: MouseEvent) => {
      const ripple = document.createElement('div');

      ripple.className = 'cursor-ripple';
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;

      document.body.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
      }, 500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    animationFrame = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        aria-hidden="true"
      />

      <div
        ref={ringRef}
        className={`custom-cursor-ring ${
          isHovering ? 'cursor-hover' : ''
        } ${isClicking ? 'cursor-click' : ''}`}
        aria-hidden="true"
      />
    </>
  );
}