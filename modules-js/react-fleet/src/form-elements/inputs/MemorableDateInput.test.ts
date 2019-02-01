import { isDateValid, setDateLimit } from './MemorableDateInput';

const today = new Date(new Date().setHours(0, 0, 0, 0));

describe('set lower limit', () => {
  const earliestDate = '1/1/2020';

  test('earliestDate provided', () => {
    expect(setDateLimit(earliestDate)).toEqual(new Date(earliestDate));
  });

  test('onlyAllowFuture', () => {
    expect(setDateLimit('', true)).toEqual(today);
  });
});

describe('set upper limit', () => {
  const latestDate = '12/12/2020';

  test('latestDate provided', () => {
    expect(setDateLimit(latestDate)).toEqual(new Date(latestDate));
  });

  test('onlyAllowPast', () => {
    expect(setDateLimit('', true)).toEqual(today);
  });
});

describe('isDateValid', () => {
  const pastDate = '12/12/2010';
  const middleDate = '6/16/2016';
  const upcomingDate = '9/7/2020';
  const futureDate = '1/1/2030';

  test(`onlyAllowPast | user entered: ${pastDate}`, () => {
    expect(
      isDateValid(new Date(pastDate), null, today, true, undefined)
    ).toEqual('');
  });

  test(`onlyAllowPast | user entered: ${futureDate}`, () => {
    expect(
      isDateValid(new Date(futureDate), null, today, true, undefined)
    ).not.toEqual('');
  });

  test(`onlyAllowFuture | user entered: ${futureDate}`, () => {
    expect(
      isDateValid(new Date(futureDate), today, null, undefined, true)
    ).toEqual('');
  });

  test(`onlyAllowFuture | user entered: ${pastDate}`, () => {
    expect(
      isDateValid(new Date(pastDate), today, null, undefined, true)
    ).not.toEqual('');
  });

  test(`onlyAllowPast && earliest: ${pastDate} | user entered: ${middleDate}`, () => {
    expect(
      isDateValid(
        new Date(middleDate),
        new Date(pastDate),
        today,
        true,
        undefined
      )
    ).toEqual('');
  });

  test(`onlyAllowPast && earliest: ${middleDate} | user entered: ${pastDate}`, () => {
    expect(
      isDateValid(
        new Date(pastDate),
        new Date(middleDate),
        today,
        true,
        undefined
      )
    ).not.toEqual('');
  });

  test(`onlyAllowFuture && latest: ${futureDate} | user entered: ${upcomingDate}`, () => {
    expect(
      isDateValid(
        new Date(upcomingDate),
        today,
        new Date(futureDate),
        undefined,
        true
      )
    ).toEqual('');
  });

  test(`onlyAllowFuture && latest: ${upcomingDate} | user entered: ${futureDate}`, () => {
    expect(
      isDateValid(
        new Date(futureDate),
        today,
        new Date(upcomingDate),
        undefined,
        true
      )
    ).not.toEqual('');
  });

  test(`earliest: ${pastDate} | user entered: ${upcomingDate}`, () => {
    expect(
      isDateValid(
        new Date(upcomingDate),
        new Date(pastDate),
        null,
        undefined,
        undefined
      )
    ).toEqual('');
  });

  test(`earliest: ${futureDate} | user entered: ${upcomingDate}`, () => {
    expect(
      isDateValid(
        new Date(upcomingDate),
        new Date(futureDate),
        null,
        undefined,
        undefined
      )
    ).not.toEqual('');
  });

  test(`latest: ${futureDate} | user entered: ${upcomingDate}`, () => {
    expect(
      isDateValid(
        new Date(upcomingDate),
        null,
        new Date(futureDate),
        undefined,
        undefined
      )
    ).toEqual('');
  });

  test(`latest: ${upcomingDate} | user entered: ${futureDate}`, () => {
    expect(
      isDateValid(
        new Date(futureDate),
        null,
        new Date(upcomingDate),
        undefined,
        undefined
      )
    ).not.toEqual('');
  });

  test(`between ${pastDate} and ${upcomingDate} | user entered: ${middleDate}`, () => {
    expect(
      isDateValid(
        new Date(middleDate),
        new Date(pastDate),
        new Date(upcomingDate),
        undefined,
        undefined
      )
    ).toEqual('');
  });

  test(`between ${pastDate} and ${middleDate} | user entered: ${upcomingDate}`, () => {
    expect(
      isDateValid(
        new Date(upcomingDate),
        new Date(pastDate),
        new Date(middleDate),
        undefined,
        undefined
      )
    ).not.toEqual('');
  });

  test(`no limits specified | user entered: ${upcomingDate} then ${pastDate}`, () => {
    expect(
      isDateValid(new Date(upcomingDate), null, null, undefined, undefined)
    ).toEqual('');

    expect(
      isDateValid(new Date(pastDate), null, null, undefined, undefined)
    ).toEqual('');
  });
});
