// @flow

import React from 'react';
import type { Service } from '../../data/types';

import AttributeField from './AttributeField';

export type Props = {
  service: Service,
  attributeChanged: (code: string, value: string | string[]) => void,
  attributes: {[code: string]: string | string[]},
};

function selectAttributes(service) {
  if (service.metadata && service.metadata.attributes) {
    return service.metadata.attributes;
  } else {
    return [];
  }
}

export default function MetadataFields({ service, attributeChanged, attributes }: Props) {
  return (
    <div>
      {
        selectAttributes(service).map((a) => (
          <AttributeField attribute={a} key={a.code} attributeChanged={attributeChanged} currentValue={attributes[a.code]} />
        ))
      }
    </div>
  );
}
