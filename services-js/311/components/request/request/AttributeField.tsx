import React, { ChangeEvent } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { css } from 'emotion';

import Question from '../../../data/store/Question';

import AttributeDateField from './AttributeDateField';

export type Props = {
  question: Question;
};

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

function renderValidationMessages({
  validationErrorMessages,
  validationInfoMessages,
}: Question) {
  return [
    validationErrorMessages.map((m, i) => (
      <div className="t--subinfo t--err m-t100" key={`err-${i}`}>
        {m}
      </div>
    )),

    validationInfoMessages.map((m, i) => (
      <div className="t--subinfo m-t100" key={`err-${i}`}>
        {m}
      </div>
    )),
  ];
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

      {renderValidationMessages(question)}
    </div>
  );
}

function renderInformationalAttribute(question) {
  return <p className="t--info">{question.description}</p>;
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
        rows={5}
        aria-required={question.required}
      />

      {renderValidationMessages(question)}
    </div>
  );
}

function renderStringAttribute(question, onChange) {
  const {
    description,
    required,
    code,
    hasSafeValue,
    requirementsMet,
    value,
  } = question;

  const errHighlight = hasSafeValue && !requirementsMet;

  return (
    <div className="txt">
      <label className="txt-l" htmlFor={code}>
        {description} {maybeRenderRequired(required)}
      </label>

      <input
        type="text"
        name={code}
        id={code}
        className={`txt-f ${errHighlight ? 'txt-f--err' : ''}`}
        value={value}
        onChange={onChange}
        aria-required={required}
      />

      {renderValidationMessages(question)}
    </div>
  );
}

function renderNumberAttribute(question, onChange) {
  const {
    description,
    required,
    code,
    hasSafeValue,
    requirementsMet,
    value,
  } = question;

  const errHighlight = hasSafeValue && !requirementsMet;

  return (
    <div className="txt">
      <label className="txt-l">
        {description} {maybeRenderRequired(required)}
      </label>

      <input
        name={code}
        id={code}
        className={`txt-f
          ${NUMERIC_FIELD_STYLE.toString()}
          ${errHighlight ? 'txt-f--err' : ''}`}
        value={value}
        onChange={onChange}
        pattern="[0-9]*"
        aria-required={required}
      />

      {renderValidationMessages(question)}
    </div>
  );
}

function renderMultiValueListAttribute(question, onChange) {
  const { description, required, code, value, valueOptions } = question;

  const values = currentValueAsArray(value);
  const lists = maybeSplitList(valueOptions, 5);

  const labelId = `${code}-label`;

  return (
    <div role="group" aria-labelledby={labelId}>
      <div className="m-v300">
        <label className="txt-l" id={labelId}>
          {description} {maybeRenderRequired(required)}
        </label>
      </div>

      <div className="g">
        {lists.map((list, i) => (
          <div
            className={lists.length === 1 ? 'g--12' : 'g--6'}
            key={`list-${i}`}
            style={{ marginTop: '-.5rem' }}
          >
            {list.map(({ key, name }) => (
              <div className="cb" key={key} style={{ marginTop: '.5rem' }}>
                <input
                  name={code}
                  id={`${code}-${key}`}
                  type="checkbox"
                  value={key}
                  className="cb-f"
                  checked={values.indexOf(key) !== -1}
                  onChange={onChange}
                />
                <label className="cb-l" htmlFor={`${code}-${key}`}>
                  {name}
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>

      {renderValidationMessages(question)}
    </div>
  );
}

function renderSingleValueListAttribute(question, onChange) {
  const { description, required, code, value, valueOptions } = question;

  const options = [...(valueOptions || [])];

  if (!required) {
    options.push({ key: '', name: 'No Answer' });
  }

  const lists = maybeSplitList(options, 5);
  const labelId = `${code}-label`;

  return (
    <div role="radiogroup" aria-labelledby={labelId}>
      <div className="m-v300">
        <label className="txt-l" id={labelId}>
          {description} {maybeRenderRequired(required)}
        </label>
      </div>
      <div className="g">
        {lists.map((list, i) => (
          <div
            className={lists.length === 1 ? 'g--12' : 'g--6'}
            key={`list-${i}`}
          >
            {list.map(({ key, name }) => (
              <div className="ra" key={key}>
                <input
                  name={code}
                  id={`${code}-${key}`}
                  type="radio"
                  value={key || '--no-answer-key--'}
                  className="ra-f"
                  checked={value === key || (key === '' && value === null)}
                  onChange={onChange}
                />
                <label className="ra-l" htmlFor={`${code}-${key}`}>
                  {name}
                </label>
              </div>
            ))
            // blank span below to be the :last-child so that all the labels have a bottom margin
            }
            <span />
          </div>
        ))}
      </div>

      {renderValidationMessages(question)}
    </div>
  );
}

@observer
export default class AttributeField extends React.Component<Props> {
  @action.bound
  onChange(ev: ChangeEvent<HTMLInputElement>) {
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
  onCheckbox(ev: ChangeEvent<HTMLInputElement>) {
    const { question } = this.props;
    question.value = (ev.target.checked || false).toString();
  }

  @action.bound
  onMultivalueList(ev: ChangeEvent<HTMLInputElement>) {
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
