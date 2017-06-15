// @flow

import soapStub from 'soap/soap-stub';
import sinon from 'sinon';

import INovah from './INovah';
import type {INovahClient, RegisterSecurtyKeyOutput} from './INovah';

jest.mock('soap', () => {
  return {
    createClient: require('soap/soap-stub').createClient,
  };
});

const FAKE_ENDPOINT = 'http://fake-endpoint.test';
const FAKE_USERNAME = 'brain.drain';
const FAKE_PASSWORD = 'palspalspals';
const FAKE_SECURITY_KEY = '853bc748-e355-48b5-8e16-990ce2d62c80';

// soap-stub assumes Sinon mocks
const clientStub: INovahClient = {
  describe: sinon.stub(),
  AddTransaction: sinon.stub(),
  PerformInquiry: sinon.stub(),
  RegisterSecurityKey: sinon.stub(),
};

clientStub.RegisterSecurityKey.respondWithSuccess = soapStub.createRespondingStub(
  ({
    RegisterSecurityKeyResult: {
      StandardResult: {
        Result: {
          ReturnCode: 'Success',
          ErrorType: 'None',
          ShortErrorMessage: null,
          LongErrorMessage: null,
          StatusInfo: 'OK',
          SecurityKey: FAKE_SECURITY_KEY,
        },
      },
    },
  }: RegisterSecurtyKeyOutput),
);

clientStub.RegisterSecurityKey.respondWithFailure = soapStub.createRespondingStub(
  ({
    RegisterSecurityKeyResult: {
      StandardResult: {
        Result: {
          ReturnCode: 'Failure',
          ErrorType: 'Auth',
          ShortErrorMessage: 'Wrong password',
          LongErrorMessage: 'The password was wrong',
          StatusInfo: null,
        },
      },
    },
  }: RegisterSecurtyKeyOutput),
);

soapStub.registerClient('inovah', FAKE_ENDPOINT + '?WSDL', clientStub);

describe('registerSecurityKey', () => {
  let opbeat: any = null;
  let iNovah;

  beforeEach(() => {
    iNovah = new INovah(FAKE_ENDPOINT, FAKE_USERNAME, FAKE_PASSWORD, opbeat);
  });

  it('returns a successful code', async () => {
    const keyPromise = iNovah.registerSecurityKey();
    clientStub.RegisterSecurityKey.respondWithSuccess();

    expect(await keyPromise).toEqual(FAKE_SECURITY_KEY);
  });

  it('handles wrong error', async () => {
    const keyPromise = iNovah.registerSecurityKey();
    clientStub.RegisterSecurityKey.respondWithFailure();

    await expect(keyPromise).rejects.toMatchSnapshot();
  });
});
