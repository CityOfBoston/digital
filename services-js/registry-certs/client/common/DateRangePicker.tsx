/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, useEffect, useState } from 'react';

import { FREEDOM_RED_LIGHT, MEDIA_MEDIUM } from '@cityofboston/react-fleet';

const CURRENT_YEAR = new Date().getFullYear();
const LIMIT_YEAR = 1870;

type RangeDate = [number, number];

type DateName = 'date1' | 'date2';

interface Props {
  onChange: (dateRange: string) => void;
  dateRange?: string;
  setRangeInvalid?: (rangeInvalid: boolean) => void;
}

/**
 * Select a date range of no more than five years. Initial date range may be
 * specified using the `dateRange` prop, using the following format:
 * 'MM/YYYY - MM/YYYY'
 */
export default function DateRangePicker(props: Props) {
  const dates = props.dateRange && datesFromString(props.dateRange);

  // If a date range is specified, convert it for the picker.
  const [date1, setDate1] = useState<RangeDate>(dates ? dates[0] : ([] as any));
  const [date2, setDate2] = useState<RangeDate>(dates ? dates[1] : ([] as any));
  const [rangeInvalid, setRangeInvalid] = useState<boolean>(false);

  const handleDateChange = (dateName: DateName, fullDate: RangeDate) => {
    if (dateName === 'date1') {
      setDate1(fullDate);
    } else {
      setDate2(fullDate);
    }
  };

  // A date range is valid if the range is no greater than five years.
  function isRangeValid(): void {
    // Only do comparison if two years have been specified.
    const yearsComplete = date1 && date1[1] > 0 && (date2 && date2[1] > 0);

    if (yearsComplete && Math.abs(date1[1] - date2[1]) > 5) {
      setRangeInvalid(true);
    } else {
      setRangeInvalid(false);
    }

    if (yearsComplete) props.onChange(createDateString());
  }

  // Create formatted date string from current dates.
  function createDateString(): string {
    return `${date1[0]}/${date1[1]} - ${date2[0]}/${date2[1]}`;
  }

  // Convert a date string to RangeDate.
  // Date string format: MM/YYYY - MM/YYYY
  function datesFromString(dateString: string): [RangeDate, RangeDate] {
    const datePair = dateString.split('-');

    function returnDate(dates): RangeDate {
      const dateSet = dates.split('/');

      return [+dateSet[0], +dateSet[1]];
    }

    return [returnDate(datePair[0]), returnDate(datePair[1])];
  }

  useEffect(() => isRangeValid(), [date1, date2]);

  useEffect(() => {
    if (props.setRangeInvalid !== undefined)
      props.setRangeInvalid(rangeInvalid);
  }, [rangeInvalid]);

  return (
    <>
      <div css={RANGE_STYLING} className={rangeInvalid ? 'range-invalid' : ''}>
        <DateSet
          handleChange={handleDateChange}
          dateName="date1"
          initialDate={date1}
        />

        <div className="to">to</div>

        <DateSet
          handleChange={handleDateChange}
          dateName="date2"
          initialDate={date2}
        />
      </div>

      {rangeInvalid ? (
        <div className="t--err">Please narrow the range to five years.</div>
      ) : (
        <></>
      )}
    </>
  );
}

interface DateSetProps {
  handleChange: (DateName, RangeDate) => void;
  dateName: DateName;
  initialDate?: RangeDate;
}

export function DateSet(props: DateSetProps) {
  const { dateName, initialDate } = props;

  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [monthInvalid, setMonthInvalid] = useState<boolean>(false);
  const [yearInvalid, setYearInvalid] = useState<boolean>(false);
  const [didUpdate, setDidUpdate] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleMonthChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;

    // Prevent user from entering more than two digits.
    if (value.length <= 2) setMonth(value);
  };

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;

    // Prevent user from entering more than four digits.
    if (value.length <= 4) setYear(value);
  };

  const isMonthValid = () => {
    if (+month > 12 || +month === 0) {
      setErrorMessage('Select a month between 1 - 12');
      setMonthInvalid(true);
    } else {
      setErrorMessage('');
      setMonthInvalid(false);
    }

    setDidUpdate(true);
  };

  const isYearValid = () => {
    if (year.length === 0) {
      setErrorMessage('');
      setYearInvalid(false);
    } else if (year.length < 4) {
      setErrorMessage('Please enter a valid year.');
      setYearInvalid(true);
    } else if (+year > CURRENT_YEAR) {
      setErrorMessage('The year cannot be in the future.');
      setYearInvalid(true);
    } else if (+year < LIMIT_YEAR) {
      setErrorMessage(`Our records only go back to ${LIMIT_YEAR}.`);
      setYearInvalid(true);
    } else {
      setErrorMessage('');
      setYearInvalid(false);
    }

    setDidUpdate(true);
  };

  function clearErrorState(monthOrYear: 'month' | 'year'): void {
    if (monthOrYear === 'month') {
      setMonthInvalid(false);

      if (!yearInvalid) {
        setErrorMessage('');
      }
    } else {
      setYearInvalid(false);

      if (!monthInvalid) {
        setErrorMessage('');
      }
    }
  }

  useEffect(() => {
    if (initialDate && initialDate.length > 0) {
      setMonth(initialDate[0].toString());
      setYear(initialDate[1].toString());
    }
  }, []);

  useEffect(() => {
    if (didUpdate) props.handleChange(dateName, [month, year]);

    setDidUpdate(false);
  }, [didUpdate]);

  return (
    <div className="date-set">
      <div
        role="group"
        aria-label={dateName.slice(0, 4) + ' ' + dateName.slice(4)}
        css={DATE_SET_STYLING}
      >
        <div>
          <label htmlFor={dateName + 'month'} className="txt-l">
            Month
          </label>
          <input
            id={dateName + 'month'}
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={handleMonthChange}
            onBlur={isMonthValid}
            onFocus={() => clearErrorState('month')}
            placeholder="MM"
            className={`txt-f ${monthInvalid ? 'txt-f--err' : ''}`}
          />
        </div>

        <div>
          <label htmlFor={dateName + 'year'} className="txt-l">
            Year
          </label>
          <input
            id={dateName + 'year'}
            type="number"
            min={LIMIT_YEAR}
            max={CURRENT_YEAR}
            value={year}
            onChange={handleYearChange}
            onBlur={isYearValid}
            onFocus={() => clearErrorState('year')}
            placeholder="YYYY"
            className={`year-field txt-f ${yearInvalid ? 'txt-f--err' : ''}`}
          />
        </div>
      </div>

      <div className="t--err">{errorMessage || <>&nbsp;</>}</div>
    </div>
  );
}

const RANGE_STYLING = css({
  input: {
    MozAppearance: 'textfield',

    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
    },

    '&::-ms-clear': {
      display: 'none',
    },
  },

  [MEDIA_MEDIUM]: {
    display: 'flex',
    alignItems: 'center',

    '> .to': {
      flex: '0 0 10%',
    },

    '> .date-set': {
      flex: '0 0 45%',
    },
  },

  '> .to': {
    marginTop: '2.25rem',
    fontSize: '120%',
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  '&.range-invalid .year-field': {
    borderColor: FREEDOM_RED_LIGHT,
  },
});

const DATE_SET_STYLING = css({
  display: 'flex',
  justifyContent: 'space-between',

  '> div': {
    flex: '0 0 30%',

    '&:last-of-type': {
      flex: '0 0 65%',
    },
  },
});
