// Yup requires Array.from(), but does not include the polyfill for IE
import 'core-js/fn/array/from';

import * as Yup from 'yup';

export const applicationForm = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  streetAddress: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zip: Yup.string()
    .required('Zip code is required')
    .matches(new RegExp(/^\d{5}$/), 'Zip codes should have 5 digits'),
  phone: Yup.number()
    .positive()
    .integer(),
  email: Yup.string()
    .email()
    .required('Email is required'),
  confirmEmail: Yup.string()
    .email()
    .required('Please enter your email again')
    .oneOf([Yup.ref('email', undefined)], 'Email addresses do not match'),
  selectedCommissions: Yup.array()
    .max(5, 'Maximum of five selections')
    .required('You must make at least one selection'),
  educationalInstitution: Yup.string().min(
    2,
    'Educational institution needs to be valid'
  ),
});
