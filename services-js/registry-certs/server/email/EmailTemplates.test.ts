import { EmailTemplates, makeEmailTemplates } from './EmailTemplates';
import { SERVICE_FEE_URI } from '../../lib/costs';

const TEST_ORDER = {
  // 1/8/2018 2:05PM
  orderDate: new Date(1515438300000),
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
      cost: 5600,
      date: null,
    },
    {
      name: 'Bruce Banner',
      quantity: 6,
      cost: 8400,
      date: null,
    },
  ],
  fixedFee: 25,
  percentageFee: 0.0215,
  serviceFeeUri: SERVICE_FEE_URI,
};

let templates: EmailTemplates;

beforeAll(async () => {
  templates = await makeEmailTemplates();
});

describe('receipt', () => {
  test('Death certificates', () => {
    const { html, subject, text } = templates.deathReceipt(TEST_ORDER);
    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Death Certificates Order #RG-DC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });

  test('Birth certificate', () => {
    const { html, subject, text } = templates.birthReceipt({
      ...TEST_ORDER,
      items: [
        {
          cost: TEST_ORDER.items[0].cost,
          quantity: TEST_ORDER.items[0].quantity,
          name: 'Carol Danvers',
          date: new Date('10/06/1976'),
        },
      ],
    });

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Birth Certificate Order #RG-DC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });

  test('Birth certificate shipped', () => {
    const { html, subject, text } = templates.birthShipped({
      ...TEST_ORDER,
      items: [
        {
          cost: TEST_ORDER.items[0].cost,
          quantity: TEST_ORDER.items[0].quantity,
          name: 'Carol Danvers',
          date: new Date('10/06/1976'),
        },
      ],
    });

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Birth Certificate Order #RG-DC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });
});
