import React from 'react';

import { TextInput } from '@cityofboston/react-fleet';


/**
 * Convenience component to simplify use with Formik.
 */
export interface Props {
  label: string;
  placeholder?: string;
  required?: boolean;
}

function TextInputContainer({
  field: { name, value },
  form: { touched, errors, handleBlur, handleChange },
  ...props
  }): JSX.Element {

  return (
    <TextInput
      variant="small"
      label={props.label}
      error={touched[name] && errors[name]}
      value={value}
      id={name}
      onBlur={handleBlur}
      onChange={handleChange}
      {...props}
    />
  );
}

export default TextInputContainer;
