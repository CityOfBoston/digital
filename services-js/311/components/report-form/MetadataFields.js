// @flow

import React from 'react';
import type { Service } from '../../data/types';

import AttributeField from './AttributeField';

export type Props = {
  service: Service,
  attributeChanged: (code: string, value: string) => mixed,
};

function selectAttributes(service) {
  if (service.metadata && service.metadata.attributes) {
    return service.metadata.attributes;
  } else {
    return [];
  }
}

export default function MetadataFields({ service, attributeChanged }: Props) {
  return (
    <div>
      { selectAttributes(service).map((a) => <AttributeField attribute={a} key={a.code} attributeChanged={attributeChanged} />) }
    </div>
  );
}
