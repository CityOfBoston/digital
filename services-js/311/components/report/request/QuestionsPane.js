// @flow

import React from 'react';
import { css } from 'glamor';
import { observer } from 'mobx-react';

import AttributeField from './AttributeField';

import type { AppStore, LocationInfo } from '../../../data/store';

export type Props = {
  store: AppStore,
  nextFunc: () => void,
};

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

function renderDescription(description: string) {
  if (description.length) {
    return <div className={DESCRIPTION_STYLE}>“{description}”</div>;
  } else {
    return null;
  }
}

function renderLocation({ address }: LocationInfo) {
  return <div className={ADDRESS_STYLE}>{address}</div>;
}

export default observer(function QuestionsPane({ store, nextFunc }: Props) {
  return (
    <div>
      { renderDescription(store.description) }
      { renderLocation(store.locationInfo) }

      {
        store.questions.map((q) => <AttributeField key={q.code} question={q} />)
      }

      <div>
        <button onClick={nextFunc} disabled={!store.questionRequirementsMet}>Next</button>
      </div>
    </div>
  );
});
