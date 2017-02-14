// @flow

import React from 'react';
import { css } from 'glamor';

import type { ServiceMetadata } from '../../store/modules/services';

export type Props = {|
  attributes: $PropertyType<$NonMaybeType<ServiceMetadata>, 'attributes'>,
|}

const STYLE = {
  textTextarea: css({
    width: '100%',
    height: 180,
  }),
};

function renderInformationalAttribute(attribute) {
  return (
    <p key={attribute.code}>{attribute.description}</p>
  );
}

function renderTextAttribute(attribute) {
  return (
    <label key={attribute.code}>
      <p>{attribute.description}</p>
      <textarea className={STYLE.textTextarea} />
    </label>
  );
}

function renderPicklistAttribute(attribute) {
  return (
    <label key={attribute.code}>
      <p>{attribute.description}</p>
      <select name={attribute.code}>
        {(attribute.values || []).map(({ key, value }) => <option value={key} key={key}>{value}</option>)}
      </select>
    </label>
  );
}

function renderAttribute(attribute) {
  switch (attribute.type) {
    case 'informational':
      return renderInformationalAttribute(attribute);
    case 'text':
      return renderTextAttribute(attribute);
    case 'picklist':
      return renderPicklistAttribute(attribute);
    default:
      return null;
  }
}

export default function MetadataForm({ attributes }: Props) {
  return (
    <div>
      {(attributes || []).map(renderAttribute)}
    </div>
  );
}
