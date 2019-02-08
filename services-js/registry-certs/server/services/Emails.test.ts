import { formatTo } from './Emails';

describe('formatTo', () => {
  it('formats when no name', () => {
    expect(formatTo('', 'nancy@mew.org')).toEqual('nancy@mew.org');
  });

  it('formats with name and no comma', () => {
    expect(formatTo('Nancy Whitehead', 'nancy@mew.org')).toEqual(
      'Nancy Whitehead <nancy@mew.org>'
    );
  });

  it('formats with name with accent', () => {
    expect(
      formatTo(
        'María Aracely Josefina Penalba de las Heras',
        'hummingbird@newwarriors.org'
      )
    ).toEqual(
      '"María Aracely Josefina Penalba de las Heras" <hummingbird@newwarriors.org>'
    );
  });

  it('formats with name with comma', () => {
    expect(
      formatTo('Jennifer Walters, Esq.', 'jwalters@walterslaw.com')
    ).toEqual('"Jennifer Walters, Esq." <jwalters@walterslaw.com>');
  });
});
