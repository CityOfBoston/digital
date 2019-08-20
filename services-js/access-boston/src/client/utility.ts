import { useRef, useEffect } from 'react';

/**
 * Use previous props or state values.
 */
export function usePrevious(value: any) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

/**
 * Capitalize first character of a word or sentence.
 * @param word string
 */
export function capitalize(word: string): string {
  return word.slice(0, 1).toUpperCase() + word.slice(1);
}
