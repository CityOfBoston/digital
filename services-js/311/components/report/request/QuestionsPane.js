// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import SectionHeader from '../../common/SectionHeader';
import DescriptionBox from '../../common/DescriptionBox';
import AttributeField from './AttributeField';

import type { AppStore } from '../../../data/store';

export type Props = {
  store: AppStore,
  nextFunc: () => void,
};

export default observer(function QuestionsPane({ store, nextFunc }: Props) {
  const { currentService, description, questions, questionRequirementsMet } = store;

  const questionsEls = [];
  questions.forEach((q, i) => {
    if (!q.visible) {
      return;
    }

    questionsEls.push(<div key={q.code}><AttributeField question={q} /></div>);

    if (i < questions.length - 1) {
      questionsEls.push(<hr className="hr hr--dash m-v500" key={`${q.code}-HR`} />);
    }
  });

  return (
    <div>
      <SectionHeader>{ currentService ? currentService.name : '' }</SectionHeader>

      <div className="m-v500">
        <div className="g g--top">
          <div className="g--7">
            <DescriptionBox
              text={description}
              placeholder="How can we help?"
              onInput={action((ev) => { store.description = ev.target.value; })}
              minHeight={100}
              maxHeight={360}
            />

            { questionsEls }
          </div>

          <img style={{ display: 'block' }} alt="" src="/static/img/311-watermark.svg" className="g--5" />
        </div>
      </div>


      <div className="g">
        <div className="g--9" />
        <button className="btn g--33" onClick={nextFunc} disabled={!questionRequirementsMet}>Next</button>
      </div>
    </div>
  );
});
