import React from 'react';
import { mount } from 'enzyme';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import DeathCertificatesDao from '../../dao/DeathCertificatesDao';

import CertificatePage, {
  deathCertificateOptionsHref,
} from './CertificatePage';

import { TYPICAL_CERTIFICATE } from '../../../fixtures/client/death-certificates';

jest.mock('../../dao/DeathCertificatesDao');

describe('getInitialProps', () => {
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao(null as any);
  });

  it('loads the cert passed in query', async () => {
    deathCertificatesDao.get.mockReturnValue(TYPICAL_CERTIFICATE);

    const initialProps = await CertificatePage.getInitialProps(
      { query: { id: '000002' }, res: undefined },
      { deathCertificatesDao }
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });

  it('handles a 404', async () => {
    deathCertificatesDao.get.mockReturnValue(null);

    const initialProps = await CertificatePage.getInitialProps(
      { query: { id: '000002' }, res: undefined },
      { deathCertificatesDao }
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });

  describe('continue link', () => {
    it('builds a full-page href to certificate options', () => {
      expect(
        deathCertificateOptionsHref(TYPICAL_CERTIFICATE.id, 5, '/search?q=jayne')
      ).toEqual(
        `/death/certificate-options?id=${TYPICAL_CERTIFICATE.id}&quantity=5&backUrl=${encodeURIComponent(
          '/search?q=jayne'
        )}`
      );
    });

    it('renders Continue as a real link so it works without client JS', () => {
      const wrapper = mount(
        <CertificatePage
          deathCertificateCart={new DeathCertificateCart()}
          siteAnalytics={new GaSiteAnalytics()}
          id="0002"
          certificate={TYPICAL_CERTIFICATE}
          backUrl="/search?q=jayne"
        />
      );

      const continueLink = wrapper
        .find('a')
        .filterWhere(n => n.text() === 'Continue');
      expect(continueLink).toHaveLength(1);
      expect(continueLink.prop('href')).toEqual(
        deathCertificateOptionsHref(
          TYPICAL_CERTIFICATE.id,
          1,
          '/search?q=jayne'
        )
      );
    });
  });
});
