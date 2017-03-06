// @flow

import React from 'react';
import { css } from 'glamor';

import AttributeField from './AttributeField';

import type { Service } from '../../../data/types';
import type { State as Request } from '../../../data/store/request';

export type ExternalProps = {
  service: Service,
  nextFunc: () => void,
}

export type ValueProps = {
  request: Request,
}

export type ActionProps = {
  setAttribute: (string, string | string[]) => void,
}

export type Props = ExternalProps & ValueProps & ActionProps;

const DESCRIPTION_STYLE = css({
  fontFamily: '"Lora", Georgia, serif',
  fontSize: 28,
  fontStyle: 'italic',
  lineHeight: 1.7,
});

const ADDRESS_STYLE = css({
  textTransform: 'uppercase',
  whiteSpace: 'pre-line',
  margin: '30px 0 0',
  fontSize: 16,
  fontWeight: 'bold',
});

function selectAttributes(service) {
  if (service.metadata && service.metadata.attributes) {
    return service.metadata.attributes;
  } else {
    return [];
  }
}

function renderDescription({ description }: Request) {
  if (description.length) {
    return <div className={DESCRIPTION_STYLE}>“{description}”</div>;
  } else {
    return null;
  }
}

function renderLocation({ address }: Request) {
  return <div className={ADDRESS_STYLE}>{address}</div>;
}

export default function QuestionsPane({ service, request, setAttribute, nextFunc }: Props) {
  // TODO(finneganh): required fields
  const allowSubmit = true;

  return (
    <div>
      { renderDescription(request) }
      { renderLocation(request) }

      {
        selectAttributes(service).map((a) => (
          <AttributeField attribute={a} key={a.code} attributeChanged={setAttribute} currentValue={request.attributes[a.code]} />
        ))
      }

      <button onClick={nextFunc} disabled={!allowSubmit}>Next</button>
    </div>
  );
}
