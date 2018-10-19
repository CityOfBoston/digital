// Yup requires Array.from(), but does not include the polyfill for IE
import 'core-js/fn/array/from';

import * as Yup from 'yup';

export interface ApplyFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  streetAddress: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  confirmEmail: string;
  commissionIds: string[];
  degreeAttained: string;
  educationalInstitution: string;
  otherInformation: string;
  coverLetter: File | Buffer | null;
  resume: File | Buffer | null;
}

// TODO(finh): These "max" values come from the database. We should enforce them
// via <input> maxLength attributes rather than showing red error messages when
// the user exceeds the limit.
export const applyFormSchema = Yup.object<ApplyFormValues>({
  firstName: Yup.string()
    .required('First name is required')
    .max(25),
  middleName: Yup.string().max(50),
  lastName: Yup.string()
    .required('Last name is required')
    .max(50),
  streetAddress: Yup.string()
    .required('Address is required')
    .max(50),
  unit: Yup.string().max(50),
  city: Yup.string()
    .required('City is required')
    .max(50),
  state: Yup.string()
    .required('State is required')
    .max(50),
  zip: Yup.string()
    .required('Zip code is required')
    .matches(new RegExp(/^\d{5}$/), 'Zip codes should have 5 digits')
    .max(50),
  // TODO(finh): use phone regexp
  phone: Yup.string().max(50),
  email: Yup.string()
    .email()
    .required('Email is required')
    .max(50),
  confirmEmail: Yup.string()
    .email()
    .required('Please enter your email again')
    .oneOf([Yup.ref('email', undefined)], 'Email addresses do not match'),
  // This transform ensures that we cast a single string to an array. Necessary
  // for when someone only signs up for one commission so the form parser
  // doesn’t make an array of values.
  //
  // We would like to use Yup’s built-in array#ensure but can’t due to:
  // https://github.com/jquense/yup/issues/343
  commissionIds: Yup.array(Yup.string())
    .transform((_, orig) => (orig == null ? [] : [].concat(orig)))
    .max(5, 'Maximum of five selections')
    .min(1),
  degreeAttained: Yup.string().max(100),
  otherInformation: Yup.string().max(1000),
  educationalInstitution: Yup.string().max(100),
  coverLetter: Yup.mixed(),
  resume: Yup.mixed(),
});
