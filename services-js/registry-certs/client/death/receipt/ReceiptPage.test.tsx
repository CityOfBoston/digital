import DeathCertificatesDao from '../../dao/DeathCertificatesDao';

import ReceiptPage from './ReceiptPage';

import { TYPICAL_ORDER } from '../../../fixtures/client/death-certificate-orders';

jest.mock('../../dao/DeathCertificatesDao');

describe('getInitialProps', () => {
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao(null as any);
  });

  it('loads the order passed in query', async () => {
    deathCertificatesDao.lookupOrder.mockReturnValue(TYPICAL_ORDER);

    const initialProps = await ReceiptPage.getInitialProps(
      {
        res: undefined,
        query: { id: 'RG-DC201801-360926', contactEmail: 'nancy@mew.org' },
      },
      { deathCertificatesDao }
    );

    expect(deathCertificatesDao.lookupOrder).toHaveBeenCalledWith(
      'RG-DC201801-360926',
      'nancy@mew.org'
    );
    expect(initialProps).toMatchSnapshot();
  });

  it('handles a 404', async () => {
    deathCertificatesDao.get.mockReturnValue(null);

    const initialProps = await ReceiptPage.getInitialProps(
      {
        res: undefined,
        query: { id: 'RG-DC201801-360926', contactEmail: 'nancy@mew.org' },
      },
      { deathCertificatesDao }
    );

    expect(deathCertificatesDao.lookupOrder).toHaveBeenCalledWith(
      'RG-DC201801-360926',
      'nancy@mew.org'
    );
    expect(initialProps).toMatchSnapshot();
  });
});
