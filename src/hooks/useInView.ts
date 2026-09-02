// src/hooks/useInView.ts
// Hook to detect if an element is in the viewport using IntersectionObserver
import { useEffect, useState, useRef, RefObject } from 'react';

export function useInView(options = { threshold: 0.1 }): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    const node = ref.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [options]);

  return [ref, inView];
}