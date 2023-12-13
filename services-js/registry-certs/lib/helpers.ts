/**
 * Capitalize first character of a word or sentence.
 * @param word string
 * @return string
 * example
 * capitalize('captain') = 'Captain'
 */
export function capitalize(word: string): string {
  return word.slice(0, 1).toUpperCase() + word.slice(1);
}

/**
 * @description Adjust date by 'days' with dynamic operator for '- | +'
 * @param {date} date Date to adjust
 * @param {number} val Value to adjust by
 * @param {string} operator Arithmatic operator for addition and substraction
 * @param {string} type Date part to modify
 * @returns {date} Returns a date object
 * @example dateAdjustedBy(new Date('12/1/2023'), 14, '+', 'days') = 'Friday Dec 15 2023 00:00:00 GMT-0500 (Eastern Standard Time)'
 */
export function dateAdjustedBy(
  date: Date = new Date(),
  val: number = 14,
  operator: '-' | '+' = '+',
  type: 'days' = 'days'
): Date {
  const operators = {
    '+': (a, b) => a + b,
    '-': (a, b) => a + b,
  };
  const modByType = { days: date => date.getDate() };
  return new Date(
    date.setDate(operators[operator](modByType[type](date), val))
  );
}

/**
 * @description Return the (estimated) pickup date for Certificate requests within -14 days
 * @param {date} date Date to determine pickup date
 * @returns {string} Pickup date string
 * @example getPickUpDate(new Date('Mon Dec 11 2023')) = '12/25/2023'
 */
export function getPickUpDate(date: Date | null | undefined): string {
  if (date && typeof date === 'object' && typeof date.getDate === 'function') {
    const pickUpDate = new Date(dateAdjustedBy(date, 14, '+'));
    return `${pickUpDate.getUTCMonth() +
      1}/${pickUpDate.getDate()}/${pickUpDate.getFullYear()}`;
  } else {
    return '';
  }
}
