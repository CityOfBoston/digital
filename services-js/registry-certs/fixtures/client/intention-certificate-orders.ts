import { DeathCertificateOrder } from '../../client/types';

export const TYPICAL_ORDER: DeathCertificateOrder = {
  id: 'RG-DC201801-360926',
  date: '1/8/2018 2:05PM',
  contactName: 'Nancy Whitehead',
  contactEmail: 'nancy@mew.org',
  contactPhone: '5551234567',
  shippingName: 'Squirrel Girl',
  shippingCompanyName: 'US Avengers',
  shippingAddress1: 'Avengers Tower',
  shippingAddress2: '',
  shippingCity: 'New York',
  shippingState: 'NY',
  shippingZip: '10001',
  items: [
    {
      certificate: {
        id: '640768',
        firstName: 'JAMES',
        lastName: 'HOWLETT (LOGAN)',
      },
      quantity: 7,
      cost: 9800,
    },
    {
      certificate: {
        id: '639896',
        firstName: 'BRUCE',
        lastName: 'BANNER',
      },
      quantity: 1,
      cost: 1400,
    },
  ],
  certificateCost: 1400,
  subtotal: 11200,
  serviceFee: 266,
  total: 11466,
};
