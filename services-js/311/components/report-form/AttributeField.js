// @flow

import React from 'react';
import { css } from 'glamor';
import type { ServiceMetadataAttribute } from '../../data/types';

export type Props = {
  attribute: ServiceMetadataAttribute,
  attributeChanged: (code: string, value: string) => mixed,
};

const TEXT_TEXTAREA_STYLE = css({
  width: '100%',
  height: 180,
});

function renderInformationalAttribute(attribute) {
  return (
    <p key={attribute.code}>{attribute.description}</p>
  );
}

function renderTextAttribute(attribute, onInput) {
  return (
    <label key={attribute.code}>
      <p>{attribute.description} {attribute.required ? '(required)' : null}</p>
      <textarea name={attribute.code} className={TEXT_TEXTAREA_STYLE} onInput={onInput} />
    </label>
  );
}

function renderPicklistAttribute(attribute, onInput) {
  return (
    <label key={attribute.code}>
      <p>{attribute.description}</p>
      <select name={attribute.code} onInput={onInput} >
        {(attribute.values || []).map(({ key, name }) => <option value={key} key={key}>{name}</option>)}
      </select>
    </label>
  );
}

export default function AttributeField({ attribute, attributeChanged }: Props) {
  const onInput = (ev: SyntheticInputEvent) => {
    attributeChanged(attribute.code, ev.target.value);
  };

  switch (attribute.type) {
    case 'INFORMATIONAL':
      return renderInformationalAttribute(attribute);
    case 'TEXT':
      return renderTextAttribute(attribute, onInput);
    case 'PICKLIST':
      return renderPicklistAttribute(attribute, onInput);
    default:
      return null;
  }
}
