/**
 * Creates a FormData from an object of values (e.g. from Formik). Ignores any
 * null or undefined values. Converts any arrays into multiple values for the
 * same key.
 *
 * Prefer this over using FormData’s <form> constructor, at least when optional
 * file inputs are being used, due to a Safari 11 bug that won’t POST FormDatas
 * that reference empty file inputs.
 */
export function makeFormData(values: Object): FormData {
  const data = new FormData();

  Object.keys(values).forEach(k => {
    const v = values[k];
    if (v === null || v === undefined) {
      return;
    } else if (Array.isArray(v)) {
      v.forEach(el => data.append(k, el));
    } else {
      // FormData#set is technically correct here, but there’s not enough
      // browser compatibility for it, so use append instead. It shouldn’t
      // matter because a key in a JS object will only appear once.
      data.append(k, v);
    }
  });

  return data;
}

/**
 * Matches 10-digit phone numbers with a variety of separators. Allows for a
 * country code, so long as that code is "1".
 *
 * Parens pull out the country code, the area code, the first 3 digits, and the
 * last 4 digits.
 *
 * Source:
 * https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s02.html
 */
export const PHONE_REGEXP = /^(?:\+?(1)[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
