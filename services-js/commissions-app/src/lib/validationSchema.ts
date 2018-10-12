// Yup requires Array.from(), but does not include the polyfill for IE
import 'core-js/fn/array/from';

import * as Yup from 'yup';

export const applicationForm = Yup.object().shape({
  firstName: Yup.string().required('First Name Is Required'),
  lastName: Yup.string().required('Last Name Is Required'),
  streetAddress: Yup.string().required('Address Is Required'),
  city: Yup.string().required('City Is Required'),
  state: Yup.string().required('State Is Required'),
  zip: Yup.string()
    .required('Zip Code Is Required')
    .matches(new RegExp(/^\d{5}$/), 'Zip Codes Should Have 5 Digits'),
  phone: Yup.number()
    .positive()
    .integer(),
  email: Yup.string()
    .email()
    .required('Email Is Required'),
  confirmEmail: Yup.string()
    .email()
    .required('Please Enter Your Email Again')
    .oneOf([Yup.ref('email', undefined)], 'Email Addresses Do Not Match'),
  selectedCommissions: Yup.array()
    .max(5, 'Maximum Of Five Selections')
    .required('You Must Make At Least One Selection'),
  typeOfDegree: Yup.string().min(2, 'Type of Degree Needs To Be Valid'),
  degreeAttained: Yup.string().min(2, 'Degree Attained Needs To Be Valid'),
  educationalInstitution: Yup.string().min(
    2,
    'Educational Institution Needs To Be Valid'
  ),
});
