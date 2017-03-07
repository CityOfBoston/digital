// @flow

import React from 'react';
import { css } from 'glamor';

import AttributeField from './AttributeField';

import type { State as Request } from '../../../data/store/request';

export type ExternalProps = {
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

export default function QuestionsPane({ request, setAttribute, nextFunc }: Props) {
  // TODO(finneganh): required fields
  const allowSubmit = true;

  return (
    <div>
      { renderDescription(request) }
      { renderLocation(request) }

      {
        request.calculatedAttributes.map((a) => (
          <AttributeField attribute={a} key={a.code} attributeChanged={setAttribute} currentValue={request.attributeValues[a.code]} />
        ))
      }

      <button onClick={nextFunc} disabled={!allowSubmit}>Next</button>
    </div>
  );
}
