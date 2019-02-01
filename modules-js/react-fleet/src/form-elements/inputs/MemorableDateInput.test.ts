import MockDate from 'mockdate';

import {
  isDateValid,
  isInputComplete,
  returnLimitAsDate,
} from './MemorableDateInput';

const TODAY = new Date(new Date('2/1/2019').setHours(0, 0, 0, 0));

beforeEach(() => {
  MockDate.set(TODAY);
});

afterEach(() => {
  MockDate.reset();
});

describe('set lower or upper limit', () => {
  const exampleDate = new Date(2020, 0, 1);
  const exampleString = '1/1/2020';

  it('will accept a string', () => {
    expect(returnLimitAsDate(exampleString, false)).toBeInstanceOf(Date);
  });

  it('will accept a Date', () => {
    expect(returnLimitAsDate(exampleDate, false)).toBeInstanceOf(Date);
  });

  it('returns today’s date if onlyAllowFuture or onlyAllowPast is specified', () => {
    expect(returnLimitAsDate('', true)).toEqual(TODAY);
  });
});

describe('isDateValid', () => {
  const oldestDate = new Date(2010, 11, 12);
  const pastDate = new Date(2016, 5, 16);
  const upcomingDate = new Date(2023, 8, 7);
  const furthestFutureDate = new Date(2030, 0, 1);

  const dateFromPast = 'The date must be from the past';
  const dateFromFuture = 'The date must be in the future';

  it(`passes if user entered ${formattedDate(
    oldestDate
  )} and onlyAllowPast is true`, () => {
    expect(isDateValid(oldestDate, null, null, true, false)).toEqual('');
  });

  it(`returns the error “${dateFromPast}” if the user entered ${formattedDate(
    furthestFutureDate
  )} and onlyAllowPast is true`, () => {
    expect(
      isDateValid(new Date(furthestFutureDate), null, null, true, false)
    ).toEqual(dateFromPast);
  });

  it(`passes if user entered ${formattedDate(
    furthestFutureDate
  )} and onlyAllowFuture is true`, () => {
    expect(
      isDateValid(new Date(furthestFutureDate), null, null, false, true)
    ).toEqual('');
  });

  it(`returns the error “${dateFromFuture}” if the user entered ${formattedDate(
    oldestDate
  )} and onlyAllowFuture is true`, () => {
    expect(isDateValid(new Date(oldestDate), null, null, false, true)).toEqual(
      dateFromFuture
    );
  });

  it(`passes if the user entered ${formattedDate(
    pastDate
  )}, the earliestDate is ${formattedDate(
    oldestDate
  )}, and onlyAllowPast is true`, () => {
    expect(
      isDateValid(new Date(pastDate), new Date(oldestDate), null, true, false)
    ).toEqual('');
  });

  it(`fails if the user entered ${formattedDate(
    furthestFutureDate
  )}, the earliestDate is ${formattedDate(
    pastDate
  )}, and onlyAllowPast is true`, () => {
    expect(
      isDateValid(
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
      isDateValid(
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
      isDateValid(
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
      isDateValid(
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
      isDateValid(
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
      isDateValid(
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
      isDateValid(
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
      isDateValid(
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
      isDateValid(
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
      isDateValid(new Date(upcomingDate), null, null, false, false)
    ).toEqual('');

    expect(isDateValid(new Date(oldestDate), null, null, false, false)).toEqual(
      ''
    );
  });

  describe('isInputComplete', () => {
    const missingDayYear = 'Date must include the day and year';
    const missingMonth = 'Date must include the month';
    const completeFields = {
      month: 12,
      day: 31,
      year: 1999,
    };

    it('returns an empty string if user has completed all fields', () => {
      expect(isInputComplete(completeFields)).toBe('');
    });

    it(`returns the error “${missingMonth}” if user has only entered values for day and year`, () => {
      expect(isInputComplete({ day: 5, year: 1984 })).toBe(missingMonth);
    });

    it(`returns the error “${missingDayYear}” if user has only entered a value for the month`, () => {
      expect(isInputComplete({ month: 6 })).toBe(missingDayYear);
    });
  });
});

function formattedDate(date: Date): string {
  return Intl.DateTimeFormat('en-US').format(date);
}
