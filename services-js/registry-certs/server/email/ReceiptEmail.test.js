// @flow

import ReceiptEmail from './ReceiptEmail';

const TEST_ORDER = {
  orderDate: new Date(1515438318 * 1000),
  orderId: 'REG-DC-201801-abcde',
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
};

test('it renders an HTML body', () => {
  const receiptEmail = new ReceiptEmail();
  expect(receiptEmail.renderHtmlBody(TEST_ORDER)).toMatchSnapshot();
});

test('it renders a text body', () => {
  const receiptEmail = new ReceiptEmail();
  expect(receiptEmail.renderTextBody(TEST_ORDER)).toMatchSnapshot();
});
