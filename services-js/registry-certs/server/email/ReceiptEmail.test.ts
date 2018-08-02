import ReceiptEmail from './ReceiptEmail';
import { SERVICE_FEE_URI } from '../../lib/costs';

const TEST_ORDER = {
  orderDate: '1/8/2018 2:05PM',
  orderId: 'RG-DC201801-100001',
  shippingName: 'Nancy Whitehead',
  shippingCompanyName: '',
  shippingAddress1: '123 Fake St.',
  shippingAddress2: '',
  shippingCity: 'Boston',
  shippingState: 'MA',
  shippingZip: '02141',
  subtotal: 14000,
  serviceFee: 132,
  total: 14132,
  items: [
    {
      name: 'Monkey Joe',
      quantity: 4,
      id: '555000',
      cost: 5600,
    },
    {
      name: 'Bruce Banner',
      quantity: 6,
      id: '667123',
      cost: 8400,
    },
  ],
  fixedFee: 25,
  percentageFee: 0.0215,
  serviceFeeUri: SERVICE_FEE_URI,
};

test('it renders an HTML body', () => {
  const receiptEmail = new ReceiptEmail();
  expect(receiptEmail.renderHtmlBody(TEST_ORDER)).toMatchSnapshot();
});

test('it renders a text body', () => {
  const receiptEmail = new ReceiptEmail();
  expect(receiptEmail.renderTextBody(TEST_ORDER)).toMatchSnapshot();
});
