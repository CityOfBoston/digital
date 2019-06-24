import { useRef, useEffect } from 'react';

/**
 * Use previous props or state values.
 */
export function usePrevious(value: any): any {
  const ref = useRef<HTMLElement>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
