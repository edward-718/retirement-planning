import { useEffect, useState, useRef, memo } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

const AnimatedNumber = memo(function AnimatedNumber({
  value,
  duration = 1000,
  formatter = (v: number) => v.toLocaleString('zh-CN'),
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) {
      setDisplayValue(endValue);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + diff * easeOut;

      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
        startTime.current = null;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  return <span className={className}>{formatter(displayValue)}</span>;
});

export default AnimatedNumber;
