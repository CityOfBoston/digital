import { capitalize, getPickUpDate, dateAdjustedBy } from './helpers';

describe('capitalize', () => {
  it('capitalizes the first character of a word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('capitalizes the first character of a sentence', () => {
    expect(capitalize('hello there')).toBe('Hello there');
  });
});

describe('dateAdjustedBy', () => {
  it('dateAdjustedBy 12/11/2023 - 12/25/2023', () => {
    const expect12252023: Date = new Date('Mon Dec 11 2023');
    const newDate = dateAdjustedBy(expect12252023, 14, '+');
    const dateStr = `${newDate.getUTCMonth() +
      1}/${newDate.getDate()}/${newDate.getFullYear()}`;

    expect(dateStr).toBe('12/25/2023');
  });
});

describe('getPickUpDate', () => {
  it('Registry Cert Pickup Date - 12/11/2023 + 14 days = 12/25/2023', () => {
    const expect12252023: Date = new Date('Mon Dec 11 2023');
    expect(getPickUpDate(expect12252023)).toBe('12/25/2023');
  });

  it('Registry Cert Pickup Date - 12/06/2023 + 14 days = 12/20/2023', () => {
    const expect12202023: Date = new Date('Mon Dec 06 2023');
    expect(getPickUpDate(expect12202023)).toBe('12/20/2023');
  });

  it('Registry Cert Pickup Date - 12/01/2023 + 14 days = 12/15/2023', () => {
    const expect12152023: Date = new Date('Mon Dec 01 2023');
    expect(getPickUpDate(expect12152023)).toBe('12/15/2023');
  });
});
