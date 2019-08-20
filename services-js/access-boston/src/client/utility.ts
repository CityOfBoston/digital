import { useEffect, useState, useRef } from 'react';

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

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Capitalize first character of a word or sentence.
 * @param word string
 */
export function capitalize(word: string): string {
  return word.slice(0, 1).toUpperCase() + word.slice(1);
}
