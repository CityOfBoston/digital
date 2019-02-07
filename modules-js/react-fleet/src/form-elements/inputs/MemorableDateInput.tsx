import React from 'react';

import { css } from 'emotion';

type Fields = {
  year: string;
  month: string;
  day: string;
};

interface Props {
  componentId?: string;
  initialDate?: string | Date;
  earliestDate?: string | Date;
  latestDate?: string | Date;
  onlyAllowPast?: boolean;
  onlyAllowFuture?: boolean;
  legend: React.ReactChild;
  handleDate: (newDate: Date | null) => void;
}

interface State {
  hasFocus: boolean;
  error: string;
  fields: Fields;
}

/**
 * Component to collect a memorable date (such as a birth date) from a user.
 *
 * An element must be passed in as the legend, commonly a header <h1-h6>.
 *
 * Default behavior is to accept any date. Passing a Date into initialDate
 * and/or latestDate will limit acceptable input, or a text string representing
 * a date can be passed in instead. String format: MM-DD-YYYY, MM/DD/YYYY, etc.
 * (https://tools.ietf.org/html/rfc2822#section-3.3)
 *
 * Similarly, an initial Date (or string) can be passed in via the initialDate
 * property.
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
  // Used to ensure unique ids if multiple inputs are in use at once.
  readonly componentId: string;

  private timeout: any;

  constructor(props: Props) {
    super(props);

    this.componentId = props.componentId
      ? props.componentId
      : new Date().getTime().toString();

    this.initial = props.initialDate
      ? new Date(new Date(props.initialDate).setHours(0, 0, 0, 0))
      : null;

    checkIfPropsValid(props);

    this.earliest = returnLimitAsDate(
      props.earliestDate || '',
      !!props.onlyAllowFuture
    );
    this.latest = returnLimitAsDate(
      props.latestDate || '',
      !!props.onlyAllowPast
    );

    this.state = {
      hasFocus: false,
      error: '',
      fields: this.initial
        ? {
            year: this.initial.getFullYear().toString(),
            month: (this.initial.getMonth() + 1).toString(),
            day: this.initial.getDate().toString(),
          }
        : {
            year: '',
            month: '',
            day: '',
          },
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
    const { year, month, day } = this.state.fields;

    // When Date is called with more than one arg, result is set to midnight.
    let date: Date | null = new Date(+year, +month - 1, +day);

    // If supplied date is out of range, clear the date value.
    if (!this.checkIfDateInRange(date)) {
      date = null;
    }

    // Call parent component’s method with the new date value.
    this.props.handleDate(date);
  }

  // For the purposes of gracefully showing/hiding error text, we want to track
  // focus/blur across all three fields in order to treat this component itself
  // as having a focus and a blur state.
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
        <legend style={{ width: '100%' }}>{this.props.legend}</legend>

        <div className={FIELDS_CONTAINER_STYLING}>
          <div>
            <label htmlFor={`${this.componentId}-month`} className="txt-l">
              Month
            </label>
            <input
              {...inputAttributes}
              id={`${this.componentId}-month`}
              name="month"
              min="1"
              max="12"
              placeholder="MM"
              value={this.state.fields.month}
            />
          </div>

          <div>
            <label htmlFor={`${this.componentId}-day`} className="txt-l">
              Day
            </label>
            <input
              {...inputAttributes}
              id={`${this.componentId}-day`}
              name="day"
              min="1"
              max="31"
              placeholder="DD"
              value={this.state.fields.day}
            />
          </div>

          <div>
            <label htmlFor={`${this.componentId}-year`} className="txt-l">
              Year
            </label>

            <input
              {...inputAttributes}
              id={`${this.componentId}-year`}
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
export function returnLimitAsDate(
  suppliedDate: string | Date,
  hasRelativeLimitation: boolean = false
): Date | null {
  let date: Date | null = null;

  if (suppliedDate || suppliedDate.length > 0) {
    date = new Date(suppliedDate);
  } else if (hasRelativeLimitation) {
    date = new Date();
  }

  if (date) {
    new Date(date.setHours(0, 0, 0, 0));
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

  if (!year || (year && year.toString().length !== 4)) {
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
  onlyAllowPast: boolean = false,
  onlyAllowFuture: boolean = false
): string {
  const dateTime = date.getTime();
  const todayTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  // success conditions for each limiting attribute:
  const passes = {
    onlyAllowPast: dateTime < todayTime,
    onlyAllowFuture: dateTime > todayTime,
    earliest: earliest && dateTime > earliest.getTime(),
    latest: latest && dateTime < latest.getTime(),
  };

  let errorString = '';

  if (onlyAllowPast) {
    if (!passes.onlyAllowPast) {
      errorString = 'The date must be from the past';
    } else if (earliest && !passes.earliest) {
      errorString = `The date must be between ${formattedDate(
        earliest
      )} and today`;
    }
  } else if (onlyAllowFuture) {
    if (!passes.onlyAllowFuture) {
      errorString = 'The date must be in the future';
    } else if (latest && !passes.latest) {
      errorString = `The date must be between today and ${formattedDate(
        latest
      )}`;
    }
    // if earlier and later are both specified, date must fall between the two.
  } else if (earliest && latest && !(passes.earliest && passes.latest)) {
    errorString = `The date must fall between ${formattedDate(
      earliest
    )} and ${formattedDate(latest)}`;
  } else if (earliest && !passes.earliest) {
    errorString = `The date must be later than ${formattedDate(earliest)}`;
  } else if (latest && !passes.latest) {
    errorString = `The date must be earlier than ${formattedDate(latest)}`;
  }

  return errorString;

  function formattedDate(date: Date): string {
    return Intl.DateTimeFormat('en-US').format(date);
  }
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
