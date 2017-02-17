// @flow

import React from 'react';
import { css } from 'glamor';
import FormDialog from '../common/FormDialog';

import type { Service } from '../../data/types';

export type Props = {
  service: ?Service,
}

const STYLE = {
  textTextarea: css({
    width: '100%',
    height: 180,
  }),
};

function getTitle(service) {
  if (service) {
    return service.name;
  } else {
    return 'Service not found';
  }
}

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
        {(attribute.values || []).map(({ key, name }) => <option value={key} key={key}>{name}</option>)}
      </select>
    </label>
  );
}

function renderAttribute(attribute) {
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

function selectAttributes(service) {
  if (service.metadata && service.metadata.attributes) {
    return service.metadata.attributes;
  } else {
    return [];
  }
}

function renderContent(service) {
  if (service) {
    return <div> {selectAttributes(service).map(renderAttribute)} </div>;
  } else {
    return null;
  }
}

export default function ServiceFormDialog({ service }: Props) {
  return (
    <FormDialog title={getTitle(service)}>
      { renderContent(service) }
    </FormDialog>
  );
}
