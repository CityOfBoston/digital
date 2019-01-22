import React from 'react';

import { RADIOITEM_SHARED_STYLING, RADIOITEM_STYLING } from './styling';

import RelatedIcon from './RelatedIcon';

interface Props {
  fieldName: string;
  fieldValue: string | undefined;
  itemValue: string;
  labelText: string;
  iconName?: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RelatedItemComponent(props: Props): JSX.Element {
  const { fieldName, fieldValue, itemValue, labelText, handleChange } = props;

  return (
    <label
      className={`${RADIOITEM_SHARED_STYLING} ${RADIOITEM_STYLING} ${
        fieldValue === itemValue ? 'selected' : ''
      } ${fieldValue && fieldValue !== itemValue ? 'inactive' : ''}`}
    >
      <RelatedIcon name={props.iconName || props.itemValue} />

      <input
        type="radio"
        name={fieldName}
        id={fieldName + itemValue}
        value={itemValue}
        checked={fieldValue === itemValue}
        onChange={handleChange}
      />

      <span>{labelText}</span>
    </label>
  );
}
