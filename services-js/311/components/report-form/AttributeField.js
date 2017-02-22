// @flow

import React from 'react';
import { css } from 'glamor';
import type { ServiceMetadataAttribute } from '../../data/types';

export type Props = {
  attribute: ServiceMetadataAttribute,
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

function renderTextAttribute(attribute) {
  return (
    <label key={attribute.code}>
      <p>{attribute.description} {attribute.required ? '(required)' : null}</p>
      <textarea className={TEXT_TEXTAREA_STYLE} />
    </label>
  );
}

function renderPicklistAttribute(attribute) {
  return (
    <label key={attribute.code}>
      <p>{attribute.description}</p>
      <select name={attribute.code}>
        {(attribute.values || []).map(({ key, name }) => <option value={key} key={key}>{name}</option>)}
      </select>
    </label>
  );
}

export default function AttributeField({ attribute }: Props) {
  switch (attribute.type) {
    case 'INFORMATIONAL':
      return renderInformationalAttribute(attribute);
    case 'TEXT':
      return renderTextAttribute(attribute);
    case 'PICKLIST':
      return renderPicklistAttribute(attribute);
    default:
      return null;
  }
}
