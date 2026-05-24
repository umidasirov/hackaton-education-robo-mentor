import '@wokwi/elements';
import { useRef, useEffect } from 'react';

interface PotentiometerProps {
  id?: string;
  value?: number; // 0-100
  x?: number;
  y?: number;
  onChange?: (value: number) => void;
}

export const Potentiometer = ({
  id,
  value = 50,
  x = 0,
  y = 0,
  onChange,
}: PotentiometerProps) => {
  const potRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (potRef.current) {
      (potRef.current as any).value = value;
    }
  }, [value]);

  useEffect(() => {
    const element = potRef.current;
    if (!element || !onChange) return;

    const handleChange = (e: Event) => {
      const t = e.target as HTMLInputElement & { value?: number };
      const v = t?.value ?? (e as CustomEvent).detail;
      if (v !== undefined) onChange(Number(v));
    };

    element.addEventListener('input', handleChange);

    return () => {
      element.removeEventListener('input', handleChange);
    };
  }, [onChange]);

  return (
    <wokwi-potentiometer
      id={id}
      ref={potRef}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
      }}
    />
  );
};
