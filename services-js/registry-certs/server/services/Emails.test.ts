import Emails from './Emails';

describe('formatTo', () => {
  let emails: Emails;

  beforeEach(() => {
    emails = new Emails('test@boston.gov', {} as any, {} as any);
  });

  it('formats when no name', () => {
    expect(emails.formatTo('', 'nancy@mew.org')).toEqual('nancy@mew.org');
  });

  it('formats with name and no comma', () => {
    expect(emails.formatTo('Nancy Whitehead', 'nancy@mew.org')).toEqual(
      'Nancy Whitehead <nancy@mew.org>'
    );
  });

  it('formats with name with accent', () => {
    expect(
      emails.formatTo(
        'María Aracely Josefina Penalba de las Heras',
        'hummingbird@newwarriors.org'
      )
    ).toEqual(
      '"María Aracely Josefina Penalba de las Heras" <hummingbird@newwarriors.org>'
    );
  });

  it('formats with name with comma', () => {
    expect(
      emails.formatTo('Jennifer Walters, Esq.', 'jwalters@walterslaw.com')
    ).toEqual('"Jennifer Walters, Esq." <jwalters@walterslaw.com>');
  });
});
