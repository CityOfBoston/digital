import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import BirthCertificateRequest from './BirthCertificateRequest';
import UploadableFile from '../models/UploadableFile';

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

describe('serialization', () => {
  let req: BirthCertificateRequest;

  beforeEach(() => {
    req = new BirthCertificateRequest();
    req.quantity = 10;
    req.uploadSessionId = '8a883b5e-f5d0-4181-b7a2-5423442054e7';
    req.answerQuestion({
      altSpelling: 'Car-Ell, Vers',
      birthDate: new Date(1968, 2, 1),
      bornInBoston: 'yes',
      firstName: 'Carol',
      lastName: 'Danvers',
      forSelf: true,
      parent1FirstName: 'Mari-Ell',
      parent2FirstName: 'Joe',
      parent2LastName: 'Danvers',
      parentsMarried: 'unknown',
      idImageFront: Object.assign(
        new UploadableFile(new File([], 'id.jpg'), req.uploadSessionId),
        { status: 'success', attachmentKey: '4' }
      ),
      supportingDocuments: [
        Object.assign(
          new UploadableFile(
            new File([], 'deployment.pdf'),
            req.uploadSessionId
          ),
          { status: 'success', attachmentKey: '10' }
        ),
      ],
    });
  });

  it('converts to JSON', () => {
    expect(req.serializeToJSON()).toMatchInlineSnapshot(`
Object {
  "quantity": 10,
  "requestInformation": Object {
    "altSpelling": "Car-Ell, Vers",
    "birthDate": "1968-03-01T05:00:00.000Z",
    "bornInBoston": "yes",
    "firstName": "Carol",
    "forSelf": true,
    "howRelated": null,
    "idImageBack": null,
    "idImageFront": Object {
      "attachmentKey": "4",
      "name": "id.jpg",
    },
    "lastName": "Danvers",
    "parent1FirstName": "Mari-Ell",
    "parent1LastName": "",
    "parent2FirstName": "Joe",
    "parent2LastName": "Danvers",
    "parentsLivedInBoston": null,
    "parentsMarried": "unknown",
    "supportingDocuments": Array [
      Object {
        "attachmentKey": "10",
        "name": "deployment.pdf",
      },
    ],
  },
  "uploadSessionId": "8a883b5e-f5d0-4181-b7a2-5423442054e7",
}
`);
  });

  it('round-trips back from JSON', () => {
    const newRequest = new BirthCertificateRequest();
    newRequest.replaceWithJson(req.serializeToJSON());
    expect(newRequest).toMatchInlineSnapshot(`
BirthCertificateRequest {
  "quantity": 10,
  "requestInformation": Object {
    "altSpelling": "Car-Ell, Vers",
    "birthDate": 1968-03-01T05:00:00.000Z,
    "bornInBoston": "yes",
    "firstName": "Carol",
    "forSelf": true,
    "howRelated": null,
    "idImageBack": null,
    "idImageFront": UploadableFile {
      "attachmentKey": "4",
      "errorMessage": null,
      "fetchGraphql": [Function],
      "file": null,
      "label": "id front",
      "name": "id.jpg",
      "progress": 0,
      "status": "success",
      "uploadRequest": null,
      "uploadSessionId": "8a883b5e-f5d0-4181-b7a2-5423442054e7",
    },
    "lastName": "Danvers",
    "parent1FirstName": "Mari-Ell",
    "parent1LastName": "",
    "parent2FirstName": "Joe",
    "parent2LastName": "Danvers",
    "parentsLivedInBoston": null,
    "parentsMarried": "unknown",
    "supportingDocuments": Array [
      UploadableFile {
        "attachmentKey": "10",
        "errorMessage": null,
        "fetchGraphql": [Function],
        "file": null,
        "label": undefined,
        "name": "deployment.pdf",
        "progress": 0,
        "status": "success",
        "uploadRequest": null,
        "uploadSessionId": "8a883b5e-f5d0-4181-b7a2-5423442054e7",
      },
    ],
  },
  "sessionStorageDisposer": null,
  "siteAnalytics": null,
  "uploadSessionId": "8a883b5e-f5d0-4181-b7a2-5423442054e7",
}
`);
  });
});
