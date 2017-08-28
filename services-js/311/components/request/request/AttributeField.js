// @flow

import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'glamor';

import type Question from '../../../data/store/Question';

import AttributeDateField from './AttributeDateField';

export type Props = {|
  question: Question,
|};

const NUMERIC_FIELD_STYLE = css({
  width: '6em',
  textAlign: 'right',
  MozAppearance: 'textfield',
  '::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
});

// Returns either one or two lists. If list’s length is less than splitLength,
// returns the entire list as the first element of an array. If list’s length
// is longer, splits in in half and returns each half.
function maybeSplitList(list, splitLength) {
  list = list || [];

  if (list.length < splitLength) {
    return [list];
  } else {
    const firstLength = Math.ceil(list.length / 2);
    return [list.slice(0, firstLength), list.slice(firstLength)];
  }
}

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

function maybeRenderRequired(required: boolean) {
  if (required) {
    return <span className="t--req">Required</span>;
  } else {
    return null;
  }
}

function renderCheckbox(question, onChange) {
  return (
    <div className="cb">
      <input
        name={question.code}
        id={question.code}
        type="checkbox"
        value="true"
        className="cb-f"
        checked={question.value === 'true'}
        onChange={onChange}
      />
      <label className="cb-l" htmlFor={question.code}>
        {question.description}
      </label>
    </div>
  );
}

function renderInformationalAttribute(question) {
  return (
    <p className="t--info">
      {question.description}
    </p>
  );
}

function renderTextAttribute(question, onChange) {
  return (
    <div className="txt">
      <label className="txt-l" htmlFor={question.code}>
        {question.description} {maybeRenderRequired(question.required)}
      </label>
      <textarea
        name={question.code}
        id={question.code}
        className="txt-f"
        value={question.value}
        onChange={onChange}
        rows="5"
        aria-required={question.required}
      />
    </div>
  );
}

function renderStringAttribute(question, onChange) {
  return (
    <div className="txt">
      <label className="txt-l" htmlFor={question.code}>
        {question.description} {maybeRenderRequired(question.required)}
      </label>
      <input
        type="text"
        name={question.code}
        id={question.code}
        className="txt-f"
        value={question.value}
        onChange={onChange}
        aria-required={question.required}
      />
    </div>
  );
}

function renderNumberAttribute(question, onChange) {
  return (
    <div className="txt">
      <label className="txt-l">
        {question.description} {maybeRenderRequired(question.required)}
      </label>
      <input
        name={question.code}
        id={question.code}
        className={`txt-f ${NUMERIC_FIELD_STYLE.toString()}`}
        value={question.value}
        onChange={onChange}
        pattern="[0-9]*"
        aria-required={question.required}
      />
    </div>
  );
}

function renderMultiValueListAttribute(question, onChange) {
  const values = currentValueAsArray(question.value);
  const lists = maybeSplitList(question.valueOptions, 5);

  const labelId = `${question.code}-label`;

  return (
    <div role="group" aria-labelledby={labelId}>
      <div className="m-v300">
        <label className="txt-l" id={labelId}>
          {question.description} {maybeRenderRequired(question.required)}
        </label>
      </div>
      <div className="g">
        {lists.map((list, i) =>
          <div
            className={lists.length === 1 ? 'g--12' : 'g--6'}
            key={`list-${i}`}
          >
            {list.map(({ key, name }) =>
              <div className="cb" key={key}>
                <input
                  name={question.code}
                  id={`${question.code}-${key}`}
                  type="checkbox"
                  value={key}
                  className="cb-f"
                  checked={values.indexOf(key) !== -1}
                  onChange={onChange}
                />
                <label className="cb-l" htmlFor={`${question.code}-${key}`}>
                  {name}
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderSingleValueListAttribute(question, onChange) {
  const options = [...(question.valueOptions || [])];

  if (!question.required) {
    options.push({ key: '', name: 'No Answer' });
  }

  const lists = maybeSplitList(options, 5);
  const labelId = `${question.code}-label`;

  return (
    <div role="radiogroup" aria-labelledby={labelId}>
      <div className="m-v300">
        <label className="txt-l" id={labelId}>
          {question.description} {maybeRenderRequired(question.required)}
        </label>
      </div>
      <div className="g">
        {lists.map((list, i) =>
          <div
            className={lists.length === 1 ? 'g--12' : 'g--6'}
            key={`list-${i}`}
          >
            {list.map(({ key, name }) =>
              <div className="ra" key={key}>
                <input
                  name={question.code}
                  id={`${question.code}-${key}`}
                  type="radio"
                  value={key || '--no-answer-key--'}
                  className="ra-f"
                  checked={
                    question.value === key ||
                    (key === '' && question.value === null)
                  }
                  onChange={onChange}
                />
                <label className="ra-l" htmlFor={`${question.code}-${key}`}>
                  {name}
                </label>
              </div>
            )
            // blank span below to be the :last-child so that all the labels have a bottom margin
            }
            <span />
          </div>
        )}
      </div>
    </div>
  );
}

@observer
export default class AttributeField extends React.Component {
  props: Props;

  @action.bound
  onChange(ev: SyntheticInputEvent) {
    const { question } = this.props;
    const { value } = ev.target;

    if (question.type === 'NUMBER') {
      question.value = value.replace(/\D+/g, '');
    } else if (question.type === 'DATE') {
      if (value) {
        const datePieces = value.split('/');
        question.value = `${datePieces[2] || ''}-${datePieces[0] ||
          ''}-${datePieces[1] || ''}`;
      } else {
        question.value = '';
      }
    } else {
      question.value = value === '--no-answer-key--' ? '' : value;
    }
  }

  @action.bound
  onCheckbox(ev: SyntheticInputEvent) {
    const { question } = this.props;
    question.value = (ev.target.checked || false).toString();
  }

  @action.bound
  onMultivalueList(ev: SyntheticInputEvent) {
    const { question } = this.props;
    const values = currentValueAsArray(question.value);

    if (ev.target.checked) {
      question.value = [...values, ev.target.value];
    } else {
      question.value = values.filter(v => v !== ev.target.value);
    }
  }

  render() {
    const { question } = this.props;

    switch (question.type) {
      case 'BOOLEAN_CHECKBOX':
        return renderCheckbox(question, this.onCheckbox);
      case 'INFORMATIONAL':
        return renderInformationalAttribute(question);
      case 'DATETIME':
      case 'DATE':
        return <AttributeDateField question={question} />;
      case 'STRING':
        return renderStringAttribute(question, this.onChange);
      case 'NUMBER':
        return renderNumberAttribute(question, this.onChange);
      case 'TEXT':
        return renderTextAttribute(question, this.onChange);
      case 'SINGLEVALUELIST':
        return renderSingleValueListAttribute(question, this.onChange);
      case 'MULTIVALUELIST':
        return renderMultiValueListAttribute(question, this.onMultivalueList);
      default:
        return null;
    }
  }
}
