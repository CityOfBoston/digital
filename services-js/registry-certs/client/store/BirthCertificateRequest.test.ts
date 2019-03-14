import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import BirthCertificateRequest from './BirthCertificateRequest';

describe('steps', () => {
  it('has steps', () => {
    const request = new BirthCertificateRequest();
    expect(request.steps).toHaveLength(8);
  });

  it('adds verification step for unknown parent marriage', () => {
    const request = new BirthCertificateRequest();

    expect(request.steps).not.toContain('verifyIdentification');

    request.answerQuestion({
      parentsMarried: 'unknown',
    });

    expect(request.steps).toContain('verifyIdentification');
  });

  it('short circuits out for clients', () => {
    const request = new BirthCertificateRequest();

    request.answerQuestion({
      forSelf: false,
      howRelated: 'client',
    });

    expect(request.steps).toEqual(['forWhom', 'clientInstructions']);
  });
});

describe('clone', () => {
  const siteAnalytics = new GaSiteAnalytics();

  it('makes a new request that changes independently', () => {
    const original = new BirthCertificateRequest();

    original.setSiteAnalytics(siteAnalytics);

    original.answerQuestion({
      firstName: 'Ken',
      lastName: 'Shiga',
    });

    const copy = original.clone();
    expect(copy.requestInformation).toMatchObject({
      firstName: 'Ken',
      lastName: 'Shiga',
    });

    copy.answerQuestion({
      firstName: 'Koi',
      lastName: 'Boi',
    });

    expect(original.requestInformation).toMatchObject({
      firstName: 'Ken',
      lastName: 'Shiga',
    });
  });
});

describe('updateFrom', () => {
  it('copies answers over', () => {
    const original = new BirthCertificateRequest();
    original.answerQuestion({
      firstName: 'Ken',
      lastName: 'Shiga',
    });

    const updated = new BirthCertificateRequest();
    updated.answerQuestion({
      firstName: 'Koi',
      lastName: 'Boi',
    });

    original.updateFrom(updated);

    expect(original.requestInformation).toMatchObject({
      firstName: 'Koi',
      lastName: 'Boi',
    });
  });

  it('copies quantity over', () => {
    const original = new BirthCertificateRequest();

    const updated = new BirthCertificateRequest();
    updated.setQuantity(5);

    original.updateFrom(updated);

    expect(original.quantity).toBe(5);
  });
});
