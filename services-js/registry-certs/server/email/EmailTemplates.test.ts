import { EmailTemplates, makeEmailTemplates } from './EmailTemplates';
import { SERVICE_FEE_URL } from '../../lib/costs';

const TEST_ORDER = {
  // 1/8/2018 2:05PM
  orderDate: new Date(1515438300000),
  orderId: '',
  shippingName: 'Nancy Whitehead',
  shippingCompanyName: '',
  shippingAddress1: '123 Fake St.',
  shippingAddress2: '',
  shippingCity: 'Boston',
  shippingState: 'MA',
  shippingZip: '02141',
  subtotal: 0,
  serviceFee: 0,
  total: 0,
  items: [],
  fixedFee: 25,
  percentageFee: 0.0215,
  serviceFeeUri: SERVICE_FEE_URL,
};

const DEATH_DETAILS = {
  orderId: 'RG-DC201801-100001',
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
};

const BIRTH_DETAILS = {
  orderId: 'RG-BC201801-100001',
  subtotal: 1400,
  total: 1456,
  items: [
    {
      cost: 1400,
      quantity: 1,
      name: 'Carol Danvers',
      date: new Date('10/06/1976'),
    },
  ],
};

const MARRIAGE_DETAILS = {
  orderId: 'RG-MC201801-100001',
  subtotal: 1400,
  total: 1456,
  items: [
    {
      cost: 1400,
      quantity: 1,
      name: 'Laurel Johnson & Terry Johnson',
      date: new Date('6/20/2016'),
    },
  ],
};

let templates: EmailTemplates;

beforeAll(async () => {
  templates = await makeEmailTemplates();
});

describe('receipt', () => {
  test('Death certificates', () => {
    const { html, subject, text } = templates.deathReceipt({
      ...TEST_ORDER,
      ...DEATH_DETAILS,
    });

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Death Certificates Order #RG-DC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });

  test('Birth certificate', () => {
    const { html, subject, text } = templates.requestReceipt('birth', {
      ...TEST_ORDER,
      ...BIRTH_DETAILS,
    });

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Birth Certificate Order #RG-BC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });

  test('Birth certificate shipped', () => {
    const { html, subject, text } = templates.requestReceipt('birth', {
      ...TEST_ORDER,
      ...BIRTH_DETAILS,
    });

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Birth Certificate Order #RG-BC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });

  test('Marriage certificate', () => {
    const { html, subject, text } = templates.requestReceipt('marriage', {
      ...TEST_ORDER,
      ...MARRIAGE_DETAILS,
    });

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Marriage Certificate Order #RG-MC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });

  test('Marriage certificate shipped', () => {
    const { html, subject, text } = templates.requestReceipt('marriage', {
      ...TEST_ORDER,
      ...MARRIAGE_DETAILS,
    });

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Marriage Certificate Order #RG-MC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });
});

describe('expired', () => {
  test('Birth certificate expired', () => {
    const testOrder = {
      ...TEST_ORDER,
      ...BIRTH_DETAILS,
    };

    const { html, subject, text } = templates.requestExpired(
      'birth',
      testOrder.orderId,
      testOrder.orderDate
    );

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Birth Certificate Order #RG-BC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });

  test('Marriage certificate expired', () => {
    const testOrder = {
      ...TEST_ORDER,
      ...MARRIAGE_DETAILS,
    };

    const { html, subject, text } = templates.requestExpired(
      'marriage',
      testOrder.orderId,
      testOrder.orderDate
    );

    expect(subject).toMatchInlineSnapshot(
      `"City of Boston Marriage Certificate Order #RG-MC201801-100001"`
    );
    expect(html).toMatchSnapshot();
    expect(text).toMatchSnapshot();
  });
});
