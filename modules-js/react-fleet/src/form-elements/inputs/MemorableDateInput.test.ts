import MockDate from 'mockdate';

import {
  dateValidError,
  inputCompleteError,
  returnLimitAsDate,
} from './MemorableDateInput';
import { MemorableDateInput } from '../../react-fleet';

const TODAY = new Date(new Date('2/1/2019').setUTCHours(0, 0, 0, 0));

beforeEach(() => {
  MockDate.set(TODAY);
});

afterEach(() => {
  MockDate.reset();
});

describe('set lower or upper limit', () => {
  const exampleDate = new Date(2020, 0, 1);

  it('will accept a Date', () => {
    expect(returnLimitAsDate(exampleDate, false)).toBeInstanceOf(Date);
  });

  it('returns today’s date if onlyAllowFuture or onlyAllowPast is specified', () => {
    expect(returnLimitAsDate(null, true)).toEqual(TODAY);
  });
});

describe('dateValidError', () => {
  const oldestDate = new Date(2010, 11, 12);
  const pastDate = new Date(2016, 5, 16);
  const upcomingDate = new Date(2023, 8, 7);
  const furthestFutureDate = new Date(2030, 0, 1);

  const dateFromPast = 'The date must be from the past';
  const dateFromFuture = 'The date must be in the future';

  it(`passes if user entered ${formattedDate(
    oldestDate
  )} and onlyAllowPast is true`, () => {
    expect(dateValidError(oldestDate, null, null, true, false)).toEqual('');
  });

  it(`returns the error “${dateFromPast}” if the user entered ${formattedDate(
    furthestFutureDate
  )} and onlyAllowPast is true`, () => {
    expect(
      dateValidError(new Date(furthestFutureDate), null, null, true, false)
    ).toEqual(dateFromPast);
  });

  it(`passes if user entered ${formattedDate(
    furthestFutureDate
  )} and onlyAllowFuture is true`, () => {
    expect(
      dateValidError(new Date(furthestFutureDate), null, null, false, true)
    ).toEqual('');
  });

  it(`returns the error “${dateFromFuture}” if the user entered ${formattedDate(
    oldestDate
  )} and onlyAllowFuture is true`, () => {
    expect(
      dateValidError(new Date(oldestDate), null, null, false, true)
    ).toEqual(dateFromFuture);
  });

  it(`passes if the user entered ${formattedDate(
    pastDate
  )}, the earliestDate is ${formattedDate(
    oldestDate
  )}, and onlyAllowPast is true`, () => {
    expect(
      dateValidError(
        new Date(pastDate),
        new Date(oldestDate),
        null,
        true,
        false
      )
    ).toEqual('');
  });

  it(`fails if the user entered ${formattedDate(
    furthestFutureDate
  )}, the earliestDate is ${formattedDate(
    pastDate
  )}, and onlyAllowPast is true`, () => {
    expect(
      dateValidError(
        new Date(furthestFutureDate),
        new Date(pastDate),
        null,
        true,
        false
      )
    ).not.toEqual('');
  });

  it(`passes if user entered ${formattedDate(
    upcomingDate
  )}, the latestDate is ${formattedDate(
    furthestFutureDate
  )}, and onlyAllowFuture is true`, () => {
    expect(
      dateValidError(
        new Date(upcomingDate),
        null,
        new Date(furthestFutureDate),
        false,
        true
      )
    ).toEqual('');
  });

  it(`fails if user entered ${formattedDate(
    furthestFutureDate
  )}, latestDate is ${formattedDate(
    upcomingDate
  )}, and onlyAllowFuture is true`, () => {
    expect(
      dateValidError(
        new Date(furthestFutureDate),
        null,
        new Date(upcomingDate),
        false,
        true
      )
    ).not.toEqual('');
  });

  it(`passes if user entered ${formattedDate(
    upcomingDate
  )} and earliestDate is ${formattedDate(oldestDate)}`, () => {
    expect(
      dateValidError(
        new Date(upcomingDate),
        new Date(oldestDate),
        null,
        false,
        false
      )
    ).toEqual('');
  });

  it(`fails if user entered ${formattedDate(
    upcomingDate
  )} and earliestDate is ${formattedDate(furthestFutureDate)}`, () => {
    expect(
      dateValidError(
        new Date(upcomingDate),
        new Date(furthestFutureDate),
        null,
        false,
        false
      )
    ).not.toEqual('');
  });

  it(`passes if user entered ${formattedDate(
    upcomingDate
  )} and latestDate is ${formattedDate(furthestFutureDate)}`, () => {
    expect(
      dateValidError(
        new Date(upcomingDate),
        null,
        new Date(furthestFutureDate),
        false,
        false
      )
    ).toEqual('');
  });

  it(`fails if user entered ${formattedDate(
    furthestFutureDate
  )} and latestDate is ${formattedDate(upcomingDate)}`, () => {
    expect(
      dateValidError(
        new Date(furthestFutureDate),
        null,
        new Date(upcomingDate),
        false,
        false
      )
    ).not.toEqual('');
  });

  it(`passes if ${formattedDate(pastDate)} is between ${formattedDate(
    oldestDate
  )} and ${formattedDate(upcomingDate)}`, () => {
    expect(
      dateValidError(
        new Date(pastDate),
        new Date(oldestDate),
        new Date(upcomingDate),
        false,
        false
      )
    ).toEqual('');
  });

  it(`fails if ${formattedDate(upcomingDate)} is not between ${formattedDate(
    oldestDate
  )} and ${formattedDate(pastDate)}`, () => {
    expect(
      dateValidError(
        new Date(upcomingDate),
        new Date(oldestDate),
        new Date(pastDate),
        false,
        false
      )
    ).not.toEqual('');
  });

  it(`should pass if no limits have been specified`, () => {
    expect(
      dateValidError(new Date(upcomingDate), null, null, false, false)
    ).toEqual('');

    expect(
      dateValidError(new Date(oldestDate), null, null, false, false)
    ).toEqual('');
  });

  describe('inputCompleteError', () => {
    const missingDayYear = 'Date must include the day and year';
    const missingMonth = 'Date must include the month';
    const completeFields = {
      month: '12',
      day: '31',
      year: '1999',
    };

    it('returns an empty string if user has completed all fields', () => {
      expect(inputCompleteError(completeFields)).toBe(null);
    });

    it(`returns the error “${missingMonth}” if user has only entered values for day and year`, () => {
      expect(inputCompleteError({ day: '5', year: '1984', month: '' })).toBe(
        missingMonth
      );
    });

    it(`returns the error “${missingDayYear}” if user has only entered a value for the month`, () => {
      expect(inputCompleteError({ day: '', month: '6', year: '' })).toBe(
        missingDayYear
      );
    });
  });
});

function formattedDate(date: Date): string {
  return MemorableDateInput.formattedDateUtc(date);
}
