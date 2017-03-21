// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import type Question from '../../../data/store/Question';

export type Props = {
  question: Question;
};

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
      <div className="m-v200"><span className="txt-l">{ question.description } {question.required ? '(required)' : null}</span></div>
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
    <label className="txt">
      <span className="txt-l">{question.description} {question.required ? '(required)' : null}</span>
      <input type="datetime-local" name={question.code} className="txt-f" value={question.value} onChange={onChange} />
    </label>
  );
}

function renderDateAttribute(question, onChange) {
  return (
    <label className="txt">
      <span className="txt-l">{question.description} {question.required ? '(required)' : null}</span>
      <input type="date" name={question.code} className="txt-f" value={question.value} onChange={onChange} />
    </label>
  );
}

function renderInformationalAttribute(question) {
  return (
    <p className="t--info">{question.description}</p>
  );
}

function renderTextAttribute(question, onChange) {
  return (
    <label className="txt">
      <span className="txt-l">{question.description} {question.required ? '(required)' : null}</span>
      <textarea name={question.code} className="txt-f" value={question.value} onChange={onChange} rows="5" />
    </label>
  );
}

function renderStringAttribute(question, onChange) {
  return (
    <label className="txt">
      <span className="txt-l">{question.description} {question.required ? '(required)' : null}</span>
      <input type="text" name={question.code} className="txt-f" value={question.value} onChange={onChange} />
    </label>
  );
}

function renderNumberAttribute(question, onChange) {
  return (
    <label className="txt">
      <span className="txt-l">{question.description} {question.required ? '(required)' : null}</span>
      <input type="number" name={question.code} className="txt-f" value={question.value} onChange={onChange} />
    </label>
  );
}

function renderSingleValueListAttributeAsRadios(question, onChange) {
  return (
    <div>
      <div className="m-v200"><span className="txt-l">{ question.description } {question.required ? '(required)' : null}</span></div>
      { (question.valueOptions || []).map(({ key, name }) => (
        <label className="ra" key={key}>
          <input name={question.code} type="radio" value={key} className="ra-f" checked={question.value === key} onChange={onChange} />
          <span className="ra-l">{name}</span>
        </label>
        ))
      }
      { !question.required && <label className="ra">
        <input name={question.code} type="radio" value="" className="ra-f" checked={question.value === '' || question.value === null} onChange={onChange} />
        <span className="ra-l">No Answer</span>
        </label>
      }
    </div>
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
    case 'DATE':
      return renderDateAttribute(question, onChange);
    case 'STRING':
      return renderStringAttribute(question, onChange);
    case 'NUMBER':
      return renderNumberAttribute(question, onChange);
    case 'TEXT':
      return renderTextAttribute(question, onChange);
    case 'SINGLEVALUELIST':
      return renderSingleValueListAttributeAsRadios(question, onChange);
    case 'MULTIVALUELIST':
      return renderMultiValueListAttribute(question, onMultivalueList);
    default:
      return null;
  }
});
