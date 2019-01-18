import React from 'react';
import { Formik } from 'formik';

/**
 * Given a ref to a Formik component, runs its validator and automatically
 * touches any fields that have both errors and values.
 *
 * Useful to run Formik when it’s initialized with values that might not be
 * valid.
 *
 * Hopefully Formik 2.0 will have something like this built-in:
 * https://github.com/jaredpalmer/formik/issues/288#issuecomment-431670630
 */
export async function runInitialValidation<T>(ref: React.RefObject<Formik<T>>) {
  const errors = ref.current
    ? await ref.current.getFormikBag().validateForm()
    : [];

  // We might have unmounted while awaiting the errors, so we have to check
  // again.
  if (ref.current) {
    const { setFieldTouched, values } = ref.current.getFormikBag();
    Object.keys(errors).forEach(k => values[k] && setFieldTouched(k));
  }
}
