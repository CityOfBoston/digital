import React, { ChangeEvent } from 'react';
import { css } from 'emotion';
import { action, observable, reaction, computed } from 'mobx';
import { observer } from 'mobx-react';

import Question from '../../../data/store/Question';

export type Props = {
  question: Question;
};

const INPUT_STYLE = css({
  textAlign: 'right',
  width: '10em',
  marginRight: '1em',
});

const INPUT_MESSAGE_CONTAINER_STYLE = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

function maybeRenderRequired(required: boolean) {
  if (required) {
    return <span className="t--req">Required</span>;
  } else {
    return null;
  }
}

@observer
export default class AttributeDateField extends React.Component<Props> {
  @observable dateValue: string = '';
  @observable timeValue: string = '';

  @observable dateFocus: boolean = false;
  @observable timeFocus: boolean = false;

  formUpdaterDisposer: Function | null = null;
  valueWritebackDisposer: Function | null = null;

  componentDidMount() {
    // Updates the form based on the question value
    this.formUpdaterDisposer = reaction(
      () => this.questionDate,
      (date: Date | null) => {
        if (date && !isNaN(date.getTime())) {
          this.dateValue = `${date.getMonth() +
            1}/${date.getDate()}/${date.getFullYear()}`;

          const hours = date.getHours();
          const minutes = date.getMinutes();

          const h = hours > 12 ? hours - 12 : hours;
          const m = minutes < 10 ? `0${minutes}` : minutes;

          const ampm = hours >= 12 && hours < 24 ? 'pm' : 'am';
          this.timeValue = `${h === 0 ? 12 : h}:${m} ${ampm}`;
        } else {
          this.dateValue = '';
          this.timeValue = '';
        }
      },
      {
        fireImmediately: true,
        name: 'date form updater',
      }
    );

    // when the valid form value changes, writes it back to the question. should
    // automatically stablize with the above updater.
    this.valueWritebackDisposer = reaction(
      () => this.validValue,
      (validValue: string | null) => {
        const { question } = this.props;

        if (validValue === null) {
          question.malformed = true;
        } else {
          question.malformed = false;
          question.value = validValue;
        }
      },
      {
        name: 'date value writeback',
      }
    );
  }

  componentWillUnmount() {
    if (this.formUpdaterDisposer) {
      this.formUpdaterDisposer();
    }

    if (this.valueWritebackDisposer) {
      this.valueWritebackDisposer();
    }
  }

  // returns a Date value for the current question.
  @computed
  get questionDate(): Date | null {
    const {
      question: { value },
    } = this.props;
    if (value && typeof value === 'string') {
      if (value.indexOf('T') >= 0) {
        return new Date(value);
      } else {
        // In this case we have a date value but no time. We want to convert
        // it into a Date value for that day in the current timezone.
        const [year, month, day] = value.split('-').map(v => parseInt(v, 10));
        return new Date(year, month - 1, day);
      }
    } else {
      return null;
    }
  }

  @action.bound
  handleDateChange(ev: ChangeEvent<HTMLInputElement>) {
    this.dateValue = ev.target.value;
  }

  @action.bound
  handleTimeChange(ev: ChangeEvent<HTMLInputElement>) {
    this.timeValue = ev.target.value;
  }

  @action.bound
  handleDateFocus() {
    this.dateFocus = true;
  }

  @action.bound
  handleDateBlur() {
    this.dateFocus = false;
  }

  @action.bound
  handleTimeFocus() {
    this.timeFocus = true;
  }

  @action.bound
  handleTimeBlur() {
    this.timeFocus = false;
  }

  @computed
  get showTime(): boolean {
    return this.props.question.type === 'DATETIME';
  }

  @computed
  get datePieces(): { month: number; day: number; year: number } | null {
    const datePieces = (this.dateValue || '').split('/');
    if (datePieces.length !== 3) {
      return null;
    }

    const month = parseInt(datePieces[0], 10);
    const day = parseInt(datePieces[1], 10);
    const year = parseInt(datePieces[2], 10);

    if (!(month && month >= 1 && month <= 12)) {
      return null;
    }

    if (!(day && day >= 1 && day <= 31)) {
      return null;
    }

    // y3k
    if (!(year && year >= 1900 && year < 3000)) {
      return null;
    }

    return { month, day, year };
  }

  @computed
  get timePieces(): { hours: number; minutes: number } | null {
    const timeMatch = (this.timeValue || '').match(
      /(\d+):(\d\d)\s*([aApP][mM])/
    );
    if (!timeMatch) {
      return null;
    }

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    if (timeMatch[3] && timeMatch[3][0].toLowerCase() === 'p' && hours !== 12) {
      hours += 12;
    }

    if (timeMatch[3] && timeMatch[3][0].toLowerCase() === 'a' && hours === 12) {
      hours -= 12;
    }

    if (hours === 24) {
      hours = 0;
    }

    if (hours < 0 || hours > 23) {
      return null;
    }

    if (minutes < 0 || minutes > 59) {
      return null;
    }

    return { hours, minutes };
  }

  @computed
  get isDateValid(): boolean {
    return (
      (this.dateValue === '' && !this.timeValue) || this.datePieces !== null
    );
  }

  @computed
  get isTimeValid(): boolean {
    return (
      !this.showTime ||
      (this.timeValue === '' && !this.dateValue) ||
      this.timePieces !== null
    );
  }

  /* combines date and time if necessary into an ISO string to write to
     the store. Returns null if the current values are not parsable, and '' if
     they're both empty.
  */
  @computed
  get validValue(): string | null {
    if (!this.dateValue && !this.timeValue) {
      return '';
    }

    const datePieces = this.datePieces;
    if (!datePieces) {
      return null;
    }

    const { month, day, year } = datePieces;

    if (this.showTime) {
      const timePieces = this.timePieces;

      if (!timePieces) {
        return null;
      }

      const { hours, minutes } = timePieces;

      const date = new Date(year, month - 1, day, hours, minutes);
      return date.toISOString();
    } else {
      return `${year}-${month < 10 ? `0${month}` : month}-${
        day < 10 ? `0${day}` : day
      }`;
    }
  }

  render() {
    const { question } = this.props;
    const { dateValue, timeValue } = this;

    return (
      <div className="txt">
        <label className="txt-l" htmlFor={question.code}>
          {question.description} {maybeRenderRequired(question.required)}
        </label>

        <div className={INPUT_MESSAGE_CONTAINER_STYLE}>
          <input
            placeholder="mm/dd/yyyy"
            name={question.code}
            id={question.code}
            className={`txt-f ${INPUT_STYLE.toString()} ${
              this.isDateValid || this.dateFocus ? '' : 'txt-f--err'
            }`}
            value={dateValue}
            onChange={this.handleDateChange}
            onFocus={this.handleDateFocus}
            onBlur={this.handleDateBlur}
            aria-required={question.required}
          />

          {this.showTime && (
            <input
              placeholder="hh:mm am/pm"
              name={`${question.code} time`}
              className={`txt-f ${INPUT_STYLE.toString()} ${
                this.isTimeValid || this.timeFocus ? '' : 'txt-f--err'
              }`}
              value={timeValue}
              onChange={this.handleTimeChange}
              onFocus={this.handleTimeFocus}
              onBlur={this.handleTimeBlur}
              aria-required={question.required}
              aria-label={`${question.description} time field`}
            />
          )}

          <span className="t--err">
            {!this.isDateValid &&
              !this.dateFocus &&
              'Please use mm/dd/yyyy to format your date. '}
            {!this.isTimeValid &&
              !this.dateFocus &&
              !this.timeFocus &&
              'Please use hh:mm am/pm to format your time. '}
          </span>
        </div>

        {question.validationErrorMessages.map((m, i) => (
          <div className="t--subinfo t--err m-t100" key={`err-${i}`}>
            {m}
          </div>
        ))}

        {question.validationInfoMessages.map((m, i) => (
          <div className="t--subinfo m-t100" key={`err-${i}`}>
            {m}
          </div>
        ))}
      </div>
    );
  }
}
