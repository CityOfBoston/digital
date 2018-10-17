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
  coverLetter: File | null;
  resume: File | null;
}

export const applyFormSchema = Yup.object<ApplyFormValues>({
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string(),
  lastName: Yup.string().required('Last name is required'),
  streetAddress: Yup.string().required('Address is required'),
  unit: Yup.string(),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zip: Yup.string()
    .required('Zip code is required')
    .matches(new RegExp(/^\d{5}$/), 'Zip codes should have 5 digits'),
  // TODO(finh): use phone regexp
  phone: Yup.string(),
  email: Yup.string()
    .email()
    .required('Email is required'),
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
    .required('You must make at least one selection'),
  degreeAttained: Yup.string(),
  otherInformation: Yup.string(),
  educationalInstitution: Yup.string().min(
    2,
    'Educational institution needs to be valid'
  ),
  coverLetter: Yup.mixed(),
  resume: Yup.mixed(),
});
