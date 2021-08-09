/** @jsx jsx */

import React from 'react';

import { css, jsx } from '@emotion/core';

type Fields = {
  year: string;
  month: string;
  day: string;
};

interface Props {
  componentId?: string;
  initialDate?: Date;
  earliestDate?: Date;
  latestDate?: Date;
  onlyAllowPast?: boolean;
  onlyAllowFuture?: boolean;
  includeToday?: boolean;
  sansFieldset?: boolean;
  hideLengend?: boolean;
  legend?: React.ReactChild;
  handleDate: (newDate: Date | null) => void;
  resetDate?: boolean;
  disabled?: boolean;
}

interface State {
  hasFocus: boolean;
  dirty: boolean;
  /**
   * A validity error message, if it exists, from the last valid date entered.
   * Stored in state because we want to keep it around while the user edits the
   * fields (at which point it can no longer be derived from the current state
   * of the fields).
   */
  lastValidityError: string | null;
  fields: Fields;
}

/**
 * Component to collect a memorable date (such as a birth date) from a user.
 *
 * An element must be passed in as the legend, commonly a header <h1-h6>.
 *
 * Default behavior is to accept any date. Passing a Date into initialDate
 * and/or latestDate will limit acceptable input.
 *
 * Similarly, an initial Date can be passed in via the initialDate property.
 *
 * All Dates should have a time representing midnight UTC.
 *
 * onlyAllowPast: If true, will only accept yesterday or earlier for a date.
 * onlyAllowFuture: If true, will only accept tomorrow or later for a date.
 * includeToday: If true, onlyAllowFuture will accept today for a date.
 *
 * Whenever the date is updated, this.props.handleDate is called.
 *
 * This component works exclusively in UTC due to bugs / inconsistencies in how
 * browsers handle daylight savings time in the past. E.g., Safari creates
 * midnight 4/10/57 should be as 4am UTC but (correctly) displays it assuming a
 * -500 offset.
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

    this.initial = props.initialDate || null;

    checkIfPropsValid(props);

    this.earliest = returnLimitAsDate(
      props.earliestDate,
      !!props.onlyAllowFuture
    );
    this.latest = returnLimitAsDate(props.latestDate, !!props.onlyAllowPast);

    this.state = {
      hasFocus: false,
      dirty: !!this.initial,
      lastValidityError: this.initial && this.isDateValid(this.initial),
      fields: this.setFields(this.initial),
    };
  }

  private setFields(date: Date | null): Fields {
    if (date) {
      return dateToFields(date);
    } else {
      return { year: '', month: '', day: '' };
    }
  }

  /**
   * Uses the UTC values of a Date to format in en-US locale.
   */
  public static formattedDateUtc(date: Date): string {
    return `${date.getUTCMonth() +
      1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  }

  /**
   * Helper to call isDateValid with all of our constraint props filled in.
   */
  private isDateValid(date: Date): string | null {
    return dateValidError(
      date,
      this.earliest,
      this.latest,
      this.props.onlyAllowPast,
      this.props.onlyAllowFuture,
      this.props.includeToday
    );
  }

  /**
   * Called when the fields change to update state. Calls the handleDate prop
   * with either a valid date or null.
   *
   * Also updates the lastValidityError state so we can keep error messages
   * around while the user edits.
   */
  private updateFields(fields: Fields) {
    let date: Date | null;
    let lastValidityError: string | null;

    if (inputCompleteError(fields)) {
      date = null;
      // We don't reset the validity error if the user hasn’t typed in a new
      // date. This lets us show the date constraints while they’re editing.
      lastValidityError = this.state.lastValidityError;
    } else {
      date = fieldsToDate(fields);
      lastValidityError = this.isDateValid(date);

      if (lastValidityError) {
        date = null;
      }
    }

    this.setState(
      {
        fields,
        lastValidityError,
      },
      () => {
        this.props.handleDate(date);
      }
    );
  }

  // For the purposes of gracefully showing/hiding error text, we want to track
  // focus/blur across all three fields in order to treat this component itself
  // as having a focus and a blur state.
  private handleFocus = (): void => {
    clearTimeout(this.timeout);
    this.setState({ hasFocus: true });
  };

  private handleBlur = (): void => {
    this.timeout = setTimeout(() => {
      let { fields } = this.state;

      // This has the effect of normalizing dates. So, for example, February
      // 31st will get changed to March 3rd. We do this only onBlur so that we
      // don’t disturb inputs if people temporarily make invalid dates while
      // editing.
      if (!inputCompleteError(fields)) {
        const date = fieldsToDate(fields);
        fields = dateToFields(date);
      }

      this.setState({
        fields,
        hasFocus: false,
        dirty: true,
      });
    }, 0);
  };

  // Handler for the user-controlled input fields.
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.updateFields({
      ...this.state.fields,
      [event.target.name]: event.target.value,
    });
  };

  /**
   * Returns the current error message to show.
   *
   * Here’s the algorithm:
   *  - Show "missing input" errors only if we’ve focused in the past (dirty)
   *    and are not currently focusing (hasFocus)
   *  - If we’re focused, show errors relating to the validity of the
   *    currently-entered date
   *  - If we’re focused (the user is editing), the validity error should be
   *    sticky if there are missing inputs
   */
  private currentError(): string | null {
    const { fields, dirty, hasFocus, lastValidityError } = this.state;

    const missingInputError = inputCompleteError(fields);

    if (this.props.disabled) return null;

    if (missingInputError) {
      if (!hasFocus && dirty) {
        return missingInputError;
      } else if (hasFocus) {
        return lastValidityError;
      } else {
        return null;
      }
    } else {
      return lastValidityError;
    }
  }

  /**
   * Reset date fields to original values if provided, or clear all fields.
   */
  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (!prevProps.resetDate && this.props.resetDate) {
      this.setState({ fields: this.setFields(null) }, () => {
        this.setState({ dirty: false });
      });
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

    const { legend } = this.props;

    const error = this.currentError();

    const legendElem = () => {
      let style = { width: '100%' };
      if (this.props.hideLengend) {
        style['display'] = 'none';
      }
      if (legend) {
        return <legend style={style}>{legend}</legend>;
      } else {
        return <span />;
      }
    };

    const content = () => {
      return (
        <div>
          {legend && legendElem()}

          <div
            css={FIELDS_CONTAINER_STYLING}
            className={this.props.disabled ? 'disabled' : ''}
          >
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
                disabled={this.props.disabled}
                maxLength={2}
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
                disabled={this.props.disabled}
                maxLength={2}
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
                min={this.earliest ? this.earliest.getUTCFullYear() : '1000'}
                max={this.latest ? this.latest.getUTCFullYear() : '9999'}
                placeholder="YYYY"
                value={this.state.fields.year}
                disabled={this.props.disabled}
                maxLength={4}
              />
            </div>
          </div>

          {error && <div className="t--err m-t200">{error}</div>}
        </div>
      );
    };

    const wFieldset = () => {
      return <fieldset css={FIELDSET_STYLING}>{content()}</fieldset>;
    };

    const returnElem = () => {
      if (this.props.sansFieldset) {
        return content();
      } else {
        return wFieldset();
      }
    };

    return returnElem();
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
}

// Determine upper or lower limit date, if applicable.
export function returnLimitAsDate(
  suppliedDate: Date | null | undefined,
  hasRelativeLimitation: boolean = false
): Date | null {
  const date =
    // We clone so that we can mutate it below
    (suppliedDate && new Date(suppliedDate)) ||
    (hasRelativeLimitation && new Date()) ||
    null;

  if (date) {
    date.setUTCHours(0, 0, 0, 0);
  }

  return date;
}

/**
 * Returns an error string if user input is incomplete, or if the
 * values are definitely out-of-bounds.
 *
 * isDateValid tests them against the validity constraints.
 */
export function inputCompleteError(fields: Fields): string | null {
  // Check for negative values in fields and resets them.
  for (var key of Object.keys(fields)) {
    if (fields[key] < 0) {
      fields[key] = fields[key] * -1;
    }
  }

  const { month, day, year } = fields;
  const missingFields: string[] = [];

  const monthInt = parseInt(month, 10);
  const dayInt = parseInt(day, 10);
  const yearInt = parseInt(year, 10);

  let errorString: string | null = null;

  if (isNaN(monthInt) || monthInt <= 0 || monthInt > 12) {
    missingFields.push('month');
  }

  if (isNaN(dayInt) || dayInt <= 0 || dayInt > 31) {
    missingFields.push('day');
  }

  if (isNaN(yearInt) || year.length !== 4) {
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
export function dateValidError(
  date: Date,
  earliest: Date | null,
  latest: Date | null,
  onlyAllowPast: boolean = false,
  onlyAllowFuture: boolean = false,
  includeToday: boolean = false
): string {
  const dateTime = date.getTime();

  // We grab this to get the browser’s assumption of the current date.
  const todayLocal = new Date();

  // Convert to the UTC equivalent of today’s date.
  const todayTime = Date.UTC(
    todayLocal.getFullYear(),
    todayLocal.getMonth(),
    todayLocal.getDate()
  );

  // If onlyAllowFuture needs to include the current day
  /**
   * Used to validate if the date passed s greater than the current date (after subtracting one day). This is dones to include the current day.
   * Returns a boolean for whether to use `onlyAllowFuture`.
   */
  const allowFuture = () => {
    const _todayLocal = new Date(new Date().setDate(new Date().getDate() - 1));
    const _todayTime = Date.UTC(
      _todayLocal.getFullYear(),
      _todayLocal.getMonth(),
      _todayLocal.getDate()
    );
    if (
      includeToday &&
      includeToday === true &&
      onlyAllowFuture &&
      onlyAllowFuture === true
    ) {
      return dateTime > _todayTime;
    } else {
      return dateTime > todayTime;
    }
  };

  // success conditions for each limiting attribute:
  const passes = {
    onlyAllowPast: dateTime < todayTime,
    onlyAllowFuture: allowFuture(),
    earliest: earliest && dateTime > earliest.getTime(),
    latest: latest && dateTime < latest.getTime(),
  };

  let errorString = '';

  if (onlyAllowPast) {
    if (!passes.onlyAllowPast) {
      errorString = 'The date must be from the past';
    } else if (earliest && !passes.earliest) {
      errorString = `The date must be between ${MemorableDateInput.formattedDateUtc(
        earliest
      )} and today`;
    }
  } else if (onlyAllowFuture) {
    if (!passes.onlyAllowFuture) {
      errorString = 'The date must be in the future';
    } else if (latest && !passes.latest) {
      errorString = `The date must be between today and ${MemorableDateInput.formattedDateUtc(
        latest
      )}`;
    }
    // if earlier and later are both specified, date must fall between the two.
  } else if (earliest && latest && !(passes.earliest && passes.latest)) {
    errorString = `The date must fall between ${MemorableDateInput.formattedDateUtc(
      earliest
    )} and ${MemorableDateInput.formattedDateUtc(latest)}`;
  } else if (earliest && !passes.earliest) {
    errorString = `The date must be later than ${MemorableDateInput.formattedDateUtc(
      earliest
    )}`;
  } else if (latest && !passes.latest) {
    errorString = `The date must be earlier than ${MemorableDateInput.formattedDateUtc(
      latest
    )}`;
  }

  return errorString;
}

function fieldsToDate({ year, month, day }: Fields): Date {
  return new Date(Date.UTC(+year, +month - 1, +day));
}

function dateToFields(date: Date): Fields {
  return {
    year: date.getUTCFullYear().toString(),
    month: (date.getUTCMonth() + 1).toString(),
    day: date.getUTCDate().toString(),
  };
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
  transition: 'opacity 0.1s',

  '> div': {
    flex: '0 0 24%',

    '&:last-of-type': {
      flex: '0 0 50%',
    },
  },

  input: {
    MozAppearance: 'textfield',

    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
    },

    '&::-ms-clear': {
      display: 'none',
    },
  },

  label: {
    marginTop: '0.5rem',
  },

  '&.disabled': {
    opacity: 0.4,

    '*': {
      cursor: 'not-allowed',
    },
  },
});
