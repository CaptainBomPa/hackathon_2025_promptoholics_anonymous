import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for animating numbers with count-up effect
 * @param {number} end - Target number to count up to
 * @param {number} duration - Animation duration in milliseconds
 * @param {number} decimals - Number of decimal places
 * @param {boolean} enabled - Whether animation is enabled
 * @returns {number} Current animated value
 */
export const useCountUp = (end, duration = 1500, decimals = 0, enabled = true) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef();
  const startTimeRef = useRef();
  const startValueRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }

    // If end value changed, start new animation from current count
    startValueRef.current = count;
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValueRef.current + (end - startValueRef.current) * easeOutQuart;
      
      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we end exactly at the target
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, enabled]);

  // Format the number with specified decimals
  return decimals > 0 ? Number(count.toFixed(decimals)) : Math.round(count);
};

export default useCountUp;