import React from 'react';

import { css } from 'emotion';

interface Props {
  initialDate?: string;
  earliestDate?: string;
  latestDate?: string;
  onlyAllowPast?: boolean;
  onlyAllowFuture?: boolean;
  legend: React.ReactChild;
  handleDate: (newDate: Date | null) => void;
}

interface State {
  hasFocus: boolean;
  error: string;
  date: Date | null;
  fields: {
    month: number;
    day: number;
    year: number;
  };
}

/**
 * Component to collect a memorable date (such as a birth date) from a user.
 *
 * An element must be passed in as the legend, commonly a header <h1-h6>.
 *
 * Default behavior is to accept any date. A text string representing a date
 * can be passed into earliestDate and/or latestDate to limit acceptable input.
 * Format: MM-DD-YYYY, MM/DD/YYYY, etc. (https://tools.ietf.org/html/rfc2822#section-3.3)
 *
 * An initial date can be passed in via the initialDate property.
 *
 * onlyAllowPast: If true, will only accept yesterday or earlier for a date.
 * onlyAllowFuture: If true, will only accept tomorrow or later for a date.
 *
 * Whenever the date is updated, this.props.handleDate is called.
 *
 * *Please note that all dates are relative to the user’s computer.
 *
 * Inspired by https://design-system.service.gov.uk/components/date-input/
 */
export default class MemorableDateInput extends React.Component<Props, State> {
  readonly earliest: Date | null;
  readonly latest: Date | null;
  readonly initial: Date | null;

  private timeout: any;

  constructor(props: Props) {
    super(props);

    this.initial = props.initialDate ? new Date(props.initialDate) : null;

    checkIfPropsValid(props);

    this.earliest = setDateLimit(
      props.earliestDate || '',
      !!props.onlyAllowFuture
    );
    this.latest = setDateLimit(props.latestDate || '', !!props.onlyAllowPast);

    this.state = {
      hasFocus: false,
      error: '',
      date: this.initial,
      fields: this.initial
        ? {
            month: this.initial.getMonth(),
            day: this.initial.getDate(),
            year: this.initial.getFullYear(),
          }
        : ({
            month: '',
            day: '',
            year: '',
          } as any),
    };
  }

  // Determine if date range limits have been declared, and whether a given
  // date is within that range. If not, this.state.error is set to reflect this.
  private checkIfDateInRange(date: Date): boolean {
    const errorString = isDateValid(
      date,
      this.earliest,
      this.latest,
      this.props.onlyAllowPast,
      this.props.onlyAllowFuture
    );

    this.setState({ error: errorString });

    return errorString.length === 0;
  }

  // If date is within range, update value. Otherwise, clear the value.
  private updateDate(): void {
    let date: Date | null = new Date(
      `${this.state.fields.month}/${this.state.fields.day}/${
        this.state.fields.year
      }`
    );

    // If supplied date is out of range, clear the date value.
    if (!this.checkIfDateInRange(date)) {
      date = null;
    }

    // Update state and call parent component’s method with the new date value.
    this.setState({ date }, () => {
      this.props.handleDate(date);
    });
  }

  // Focus and blur handlers are used to determine whether a user is focused
  // on any of the fields for this component.
  private handleFocus = (): void => {
    clearTimeout(this.timeout);

    this.setState({ hasFocus: true });
  };

  private handleBlur = (): void => {
    this.timeout = setTimeout(() => this.setState({ hasFocus: false }), 0);
  };

  // Handler for the user-controlled input fields.
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      fields: {
        ...this.state.fields,
        [event.target.name]: event.target.value,
      },
    });
  };

  public componentDidUpdate(
    _prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    const { fields } = this.state;
    const errorString = isInputComplete(fields);

    // Only calculate a Date from the user-supplied values when a complete date
    // has been entered by the user.
    if (prevState.fields !== fields && errorString.length === 0) {
      this.updateDate();
    }

    // Always clear errors when user focuses on a field.
    if (!prevState.hasFocus && this.state.hasFocus) {
      this.setState({ error: '' });
      // If user leaves the component but hasn’t entered a valid date, show error.
    } else if (prevState.hasFocus && !this.state.hasFocus) {
      this.setState({ error: errorString });
    }
  }

  public render() {
    const inputAttributes = {
      type: 'number',
      className: 'txt-f',
      onChange: this.handleChange,
      onBlur: this.handleBlur,
      onFocus: this.handleFocus,
    };

    return (
      <fieldset className={FIELDSET_STYLING}>
        <legend>{this.props.legend}</legend>

        <div className={FIELDS_CONTAINER_STYLING}>
          <div>
            <label htmlFor="month" className="txt-l">
              Month
            </label>
            <input
              {...inputAttributes}
              id="month"
              name="month"
              min="1"
              max="12"
              placeholder="MM"
              value={this.state.fields.month}
            />
          </div>

          <div>
            <label htmlFor="day" className="txt-l">
              Day
            </label>
            <input
              {...inputAttributes}
              id="day"
              name="day"
              min="1"
              max="31"
              placeholder="DD"
              value={this.state.fields.day}
            />
          </div>

          <div>
            <label htmlFor="year" className="txt-l">
              Year
            </label>

            <input
              {...inputAttributes}
              id="year"
              name="year"
              min={this.earliest ? this.earliest.getFullYear() : '1000'}
              max={this.latest ? this.latest.getFullYear() : '9999'}
              placeholder="YYYY"
              value={this.state.fields.year}
            />
          </div>
        </div>
        {this.state.error.length > 0 && (
          <div className="t--err">{this.state.error}</div>
        )}
      </fieldset>
    );
  }
}

/**
 * This function is intended to provide developer support by ensuring
 * the properties passed into the component are valid.
 *
 * Thrown errors are left uncaught to call attention to the fact!
 */
function checkIfPropsValid(props: Props): void {
  const todayTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const earliestDateTime = props.earliestDate
    ? new Date(props.earliestDate).getTime()
    : null;
  const latestDateTime = props.latestDate
    ? new Date(props.latestDate).getTime()
    : null;

  const isNotValid =
    props.initialDate &&
    isDateValid(
      new Date(props.initialDate),
      props.earliestDate ? new Date(props.earliestDate) : null,
      props.latestDate ? new Date(props.latestDate) : null,
      props.onlyAllowPast,
      props.onlyAllowFuture
    );

  // yesterdayTime and tomorrowTime are both true
  if (props.onlyAllowPast && props.onlyAllowFuture) {
    throw new Error('onlyAllowPast and onlyAllowFuture can’t BOTH be true!');
  }

  if (earliestDateTime) {
    // earliestTime is the same or later date than latestTime
    if (latestDateTime && earliestDateTime >= latestDateTime) {
      throw new Error(
        `earliestDate must come before latestDate.
        Received: earliestDate: ${props.earliestDate} latestDate: ${
          props.latestDate
        }`
      );

      // onlyAllowPast is true, but earliestTime is today or later
    } else if (props.onlyAllowPast && earliestDateTime >= todayTime) {
      throw new Error(
        `When onlyAllowPast is true, earliestDate must be yesterday or earlier.
          
          Received: earliestDate: ${props.earliestDate}`
      );

      // onlyAllowFuture is true, but earliestTime is tomorrow or earlier
    } else if (props.onlyAllowFuture && earliestDateTime <= todayTime) {
      throw new Error(
        `When onlyAllowFuture is true, earliestDate must be tomorrow or later.
        
        Received: earliestDate: ${props.earliestDate}`
      );
    }
  }

  if (latestDateTime) {
    // onlyAllowPast is true, but latestTime is today or later
    if (props.onlyAllowPast && latestDateTime >= todayTime) {
      throw new Error(
        `When onlyAllowPast is true, latestDate must be yesterday or earlier.
        Received: latestDate: ${props.latestDate}`
      );

      // onlyAllowFuture is true, but latestTime is today or earlier
    } else if (props.onlyAllowFuture && latestDateTime <= todayTime) {
      throw new Error(
        `When onlyAllowFuture is true, latestDate must be tomorrow or later.
        Received: latestDate: ${props.latestDate}`
      );
    }
  }

  if (isNotValid && isNotValid.length > 0) {
    throw new Error(
      `Initial date is not valid: ${isNotValid}
    Received: initialDate: ${props.initialDate}`
    );
  }
}

// Determine upper or lower limit date, if applicable.
export function setDateLimit(
  suppliedDate: string,
  hasRelativeLimitation: boolean = false
): Date | null {
  const supplied = suppliedDate.length > 0 ? new Date(suppliedDate) : null;
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  let date: Date | null = null;

  if (supplied) {
    date = supplied;
  } else if (hasRelativeLimitation) {
    date = today;
  }

  return date;
}

/**
 * Returns an error string if user input is incomplete.
 */
export function isInputComplete(fields): string {
  const { month, day, year } = fields;
  const missingFields: string[] = [];

  let errorString = '';

  if ((month > 0 && month <= 12) === false) {
    missingFields.push('month');
  }

  if ((day > 0 && day <= 31) === false) {
    missingFields.push('day');
  }

  if ((year.toString().length === 4) === false) {
    missingFields.push('year');
  }

  // One field has been skipped
  if (missingFields.length === 1) {
    errorString = `Date must include the ${missingFields[0]}`;
    // Only one field has user input
  } else if (missingFields.length === 2) {
    errorString = `Date must include the ${missingFields[0]} and ${
      missingFields[1]
    }`;
    // All fields missing
  } else if (missingFields.length === 3) {
    errorString = 'Please enter a date';
  }

  return errorString;
}

/**
 * Returns useful error string if a given date is not valid.
 */
export function isDateValid(
  date: Date,
  earliest: Date | null,
  latest: Date | null,
  onlyAllowPast: boolean | undefined,
  onlyAllowFuture: boolean | undefined
): string {
  const dateTime = date.getTime();
  const todayTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  let errorString = '';

  if (onlyAllowPast) {
    if (dateTime > todayTime) {
      errorString = 'The date must be from the past';
    } else if (earliest && dateTime < earliest.getTime()) {
      errorString = `The date must be between ${Intl.DateTimeFormat(
        'en-US'
      ).format(earliest)} and today`;
    }
  } else if (onlyAllowFuture) {
    if (dateTime < todayTime) {
      errorString = 'The date must be in the future';
    } else if (latest && dateTime > latest.getTime()) {
      errorString = `The date must be between today and ${Intl.DateTimeFormat(
        'en-US'
      ).format(latest)}`;
    }
    // if earlier and later are specified, date must fall within these limits.
  } else if (
    earliest &&
    latest &&
    (dateTime < earliest.getTime() && dateTime > latest.getTime())
  ) {
    errorString = `The date must fall between ${Intl.DateTimeFormat(
      'en-US'
    ).format(earliest)} and ${Intl.DateTimeFormat('en-US').format(latest)}`;
  } else if (earliest && dateTime < earliest.getTime()) {
    errorString = `The date must be later than ${Intl.DateTimeFormat(
      'en-US'
    ).format(earliest)}`;
  } else if (latest && dateTime > latest.getTime()) {
    errorString = `The date must be earlier than ${Intl.DateTimeFormat(
      'en-US'
    ).format(latest)}`;
  }

  return errorString;
}

const FIELDSET_STYLING = css({
  border: 'none',
  padding: 0,
  margin: 0,
  legend: {
    paddingLeft: 0,
    fontSize: '120%',
  },
});

const FIELDS_CONTAINER_STYLING = css({
  display: 'flex',
  justifyContent: 'space-between',

  '> div': {
    flex: '0 0 24%',

    '&:last-of-type': {
      flex: '0 0 50%',
    },
  },
  input: {
    '-moz-appearance': 'textfield',

    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
    },

    '&::-ms-clear': {
      display: 'none',
    },
  },
  label: {
    marginTop: '0.5rem',
  },
});
