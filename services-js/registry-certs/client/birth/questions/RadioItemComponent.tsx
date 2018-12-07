import React from 'react';

interface Props {
  fieldName: string;
  fieldValue: string | undefined;
  itemValue: string;
  labelText: string;
  labelIcon?: React.ReactNode;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// todo: icon will be passed in, and label text will be visually hidden
export default function RadioItemComponent(props: Props): JSX.Element {
  const { fieldName, fieldValue, itemValue, labelText, handleChange } = props;

  return (
    <div>
      <input
        type="radio"
        name={fieldName}
        id={fieldName + itemValue}
        value={itemValue}
        checked={fieldValue === itemValue}
        onChange={handleChange}
      />
      <label htmlFor={fieldName + itemValue}>{labelText}</label>
    </div>
  );
}
