/**
 * Capitalize first character of a word or sentence.
 * @param word string
 */
export function capitalize(word: string): string {
  return word.slice(0, 1).toUpperCase() + word.slice(1);
}
