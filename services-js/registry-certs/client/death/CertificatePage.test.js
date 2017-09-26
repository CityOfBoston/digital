// @flow
import Cart from '../store/Cart';
import DeathCertificatesDao from '../dao/DeathCertificatesDao';

import { wrapCertificatePageController } from './CertificatePage';

import { TYPICAL_CERTIFICATE } from '../../fixtures/client/death-certificates';

jest.mock('../dao/DeathCertificatesDao');

describe('getInitialProps', () => {
  let CertificatePageController;
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao((null: any));

    const dependencies: any = { deathCertificatesDao };
    CertificatePageController = wrapCertificatePageController(
      () => dependencies,
      () => null
    );
  });

  it('loads the cert passed in query', async () => {
    deathCertificatesDao.get.mockReturnValue(TYPICAL_CERTIFICATE);

    const initialProps = await CertificatePageController.getInitialProps(
      ({ query: { id: '000002' } }: any)
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });

  it('handles a 404', async () => {
    deathCertificatesDao.get.mockReturnValue(null);

    const initialProps = await CertificatePageController.getInitialProps(
      ({ query: { id: '000002' } }: any)
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });
});

describe('contentProps', () => {
  describe('addToCart', () => {
    let cart;
    let contentProps;

    beforeEach(() => {
      cart = new Cart();

      const dependencies: any = { cart };
      const CertificatePageController = wrapCertificatePageController(
        () => dependencies,
        props => {
          contentProps = props;
        }
      );

      new CertificatePageController({
        id: '00002',
        certificate: TYPICAL_CERTIFICATE,
      }).render();
    });

    it('redirects to search for a query', () => {
      contentProps.addToCart(5);
      expect(cart.size).toEqual(5);
    });
  });
});
