// @flow

import React from 'react';
import { css } from 'glamor';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import type Question from '../../../data/store/Question';

export type Props = {
  question: Question;
};

const TEXT_TEXTAREA_STYLE = css({
  width: '100%',
  height: 180,
});

const TEXT_INPUT_STYLE = css({
  width: '100%',
  padding: 10,
  fontSize: 18,
});

const NUMBER_INPUT_STYLE = css({
  padding: 10,
  fontSize: 18,
  textAlign: 'right',
});

const DATETIME_INPUT_STYLE = css({
  padding: 10,
  fontSize: 18,
});

function currentValueAsArray(currentValue): string[] {
  if (!currentValue) {
    return [];
  }

  currentValue = currentValue.slice();

  if (Array.isArray(currentValue)) {
    return currentValue;
  } else {
    return [currentValue];
  }
}

function renderCheckbox(question, onChange) {
  return (
    <label className="cb">
      <input name={question.code} type="checkbox" value="true" className="cb-f" checked={question.value === 'true'} onChange={onChange} />
      <span className="cb-l">{question.description}</span>
    </label>
  );
}

function renderMultiValueListAttribute(question, onChange) {
  const values = currentValueAsArray(question.value);

  return (
    <div>
      { question.description }
      { (question.valueOptions || []).map(({ key, name }) => (
        <label className="cb" key={key}>
          <input name={question.code} type="checkbox" value={key} className="cb-f" checked={values.indexOf(key) !== -1} onChange={onChange} />
          <span className="cb-l">{name}</span>
        </label>
      ))
    }
    </div>
  );
}

function renderDatetimeAttribute(question, onChange) {
  return (
    <label key={question.code}>
      <p>{question.description} {question.required ? '(required)' : null}</p>
      <input type="date" name={question.code} className={DATETIME_INPUT_STYLE} value={question.value} onChange={onChange} />
    </label>
  );
}

function renderInformationalAttribute(question) {
  return (
    <p key={question.code}>{question.description}</p>
  );
}

function renderTextAttribute(question, onChange) {
  return (
    <label key={question.code}>
      <p>{question.description} {question.required ? '(required)' : null}</p>
      <textarea name={question.code} className={TEXT_TEXTAREA_STYLE} value={question.value} onChange={onChange} />
    </label>
  );
}

function renderStringAttribute(question, onChange) {
  return (
    <label key={question.code}>
      <p>{question.description} {question.required ? '(required)' : null}</p>
      <input type="text" name={question.code} className={TEXT_INPUT_STYLE} value={question.value} onChange={onChange} />
    </label>
  );
}

function renderNumberAttribute(question, onChange) {
  return (
    <label key={question.code}>
      <p>{question.description} {question.required ? '(required)' : null}</p>
      <input type="number" name={question.code} className={NUMBER_INPUT_STYLE} value={question.value} onChange={onChange} />
    </label>
  );
}

function renderSingleValueListAttribute(question, onChange) {
  return (
    <label key={question.code}>
      <p>{question.description} {question.required ? '(required)' : null}</p>
      <select name={question.code} onChange={onChange} value={question.value}>
        <option disabled selected={question.value === null}>Please choose</option>
        <option disabled>--------------------------</option>
        {(question.valueOptions || []).map(({ key, name }) => <option value={key} key={key}>{name}</option>)}
        { !question.required && <option disabled>--------------------------</option> }
        { !question.required && <option value="">No answer</option> }
      </select>
    </label>
  );
}

export default observer(function AttributeField({ question }: Props) {
  if (!question.visible) {
    return null;
  }

  const onChange = action('onChange', (ev: SyntheticInputEvent) => {
    question.value = ev.target.value;
  });

  const onCheckbox = action('onCheckbox', (ev: SyntheticInputEvent) => {
    question.value = (ev.target.checked || false).toString();
  });

  const onMultivalueList = action('onMultivalueList', (ev: SyntheticInputEvent) => {
    const values = currentValueAsArray(question.value);

    if (ev.target.checked) {
      question.value = [...values, ev.target.value];
    } else {
      question.value = values.filter((v) => v !== ev.target.value);
    }
  });

  switch (question.type) {
    case 'BOOLEAN_CHECKBOX':
      return renderCheckbox(question, onCheckbox);
    case 'INFORMATIONAL':
      return renderInformationalAttribute(question);
    case 'DATETIME':
      return renderDatetimeAttribute(question, onChange);
    case 'STRING':
      return renderStringAttribute(question, onChange);
    case 'NUMBER':
      return renderNumberAttribute(question, onChange);
    case 'TEXT':
      return renderTextAttribute(question, onChange);
    case 'SINGLEVALUELIST':
      return renderSingleValueListAttribute(question, onChange);
    case 'MULTIVALUELIST':
      return renderMultiValueListAttribute(question, onMultivalueList);
    default:
      return null;
  }
});
