import { resolvers, CaseRoot } from './case';
import { DetailedServiceRequest } from '../services/Open311';

const CASE_WITH_NO_PHOTOS: DetailedServiceRequest = {
  id: '500r0000002dwwsAAA',
  service_request_id: '18-00012429',
  status: 'closed',
  long: -71.05742059114559,
  lat: 42.358723671506326,
  media_url: null,
  service_name: 'Bicycle abandoned on the street or sidewalk',
  service_code: 'ABNDBIKE',
  description: 'bike',
  requested_datetime: '2018-02-02T18:09:34.000Z',
  expected_datetime: '2018-02-13T18:09:34.000Z',
  updated_datetime: '2018-02-02T18:09:34.000Z',
  address: '2 Devonshire Pl, Boston, 02109',
  zipcode: '02109',
  address_id: '164247',
  agency_responsible: null,
  service_notice: null,
  status_notes: null,
  origin: 'API',
  source: 'City Worker',
  priority: 'Low',
  service_level_agreement: {
    type: 7,
    value: 'Business Days',
  },

  address_details: 'detaila',
  duplicate_parent_service_request_id: null,
  parent_service_request_id: null,
  reported_location: {
    address: null,
    address_id: null,
    lat: 42.3587181,
    long: -71.0573287,
  },

  owner: {
    id: '00Gr0000000XANVEA4',
    name: 'BTDT BostonBikes',
    type: 'queue',
  },

  contact: {
    first_name: 'Test',
    last_name: 'Test',
    phone: null,
    email: 'test@boston.gov',
  },

  closure_details: {
    reason: 'Case Investigated',
    comment:
      'The bike was not found at this location when a Boston Transportation Department team member went to tag it. If the problem persists or if you have any questions, please feel free to contact us through BOS:311.',
  },

  attributes: [],
  activities: [],
  events: [],
};

const CASE_WITH_URL_PHOTO: CaseRoot = {
  source: 'Open311',
  request: {
    ...CASE_WITH_NO_PHOTOS,
    media_url:
      'https://spot-boston-res.cloudinary.com/image/upload/v1521651380/boston/development/l79qpl0z81lmfzdt3rqd.jpg',
  },
};

const CASE_WITH_COMPLEX_PHOTO: CaseRoot = {
  source: 'Open311',
  request: {
    ...CASE_WITH_NO_PHOTOS,
    media_url: [
      {
        id: 'a0ir0000000DJLoAAO',
        url:
          'https://res.cloudinary.com/spot-boston/image/upload/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
        tags: ['Close'],
      },
    ],
  },
};

const CASE_WITH_ACTIVITY_PHOTO: CaseRoot = {
  source: 'Open311',
  request: {
    ...CASE_WITH_NO_PHOTOS,
    activities: [
      {
        code: 'ABNDBIKE-INSP2',
        order: 1,
        description: null,
        status: 'Complete',
        completion_date: '2018-03-21T16:56:30.000Z',
        media_url: [
          {
            id: 'a0ir0000000DJLoAAO',
            url:
              'https://res.cloudinary.com/spot-boston/image/upload/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
            tags: ['Close'],
          },
        ],
      },

      {
        code: 'ABNDBIKE-PICKUP',
        order: 2,
        description: null,
        status: 'Void',
        completion_date: null,
      },
    ],
  },
};

describe('photos', () => {
  it('returns a URL photo', () => {
    const images = resolvers.Case.images(CASE_WITH_URL_PHOTO, {}, {} as any);
    expect(images).toMatchInlineSnapshot(`
Array [
  Object {
    "originalUrl": "https://spot-boston-res.cloudinary.com/image/upload/v1521651380/boston/development/l79qpl0z81lmfzdt3rqd.jpg",
    "squarePreviewUrl": "https://spot-boston-res.cloudinary.com/image/upload/t_large_square_preview/v1521651380/boston/development/l79qpl0z81lmfzdt3rqd.jpg",
    "squareThumbnailUrl": "https://spot-boston-res.cloudinary.com/image/upload/t_square_thumbnail/v1521651380/boston/development/l79qpl0z81lmfzdt3rqd.jpg",
    "tags": Array [],
  },
]
`);
  });

  it('returns a complex photo', () => {
    const images = resolvers.Case.images(
      CASE_WITH_COMPLEX_PHOTO,
      {},
      {} as any
    );
    expect(images).toMatchInlineSnapshot(`
Array [
  Object {
    "originalUrl": "https://res.cloudinary.com/spot-boston/image/upload/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg",
    "squarePreviewUrl": "https://res.cloudinary.com/spot-boston/image/upload/t_large_square_preview/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg",
    "squareThumbnailUrl": "https://res.cloudinary.com/spot-boston/image/upload/t_square_thumbnail/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg",
    "tags": Array [
      "Close",
    ],
  },
]
`);
  });

  it('gets photos from activities', () => {
    const images = resolvers.Case.images(
      CASE_WITH_ACTIVITY_PHOTO,
      {},
      {} as any
    );
    expect(images).toMatchInlineSnapshot(`
Array [
  Object {
    "originalUrl": "https://res.cloudinary.com/spot-boston/image/upload/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg",
    "squarePreviewUrl": "https://res.cloudinary.com/spot-boston/image/upload/t_large_square_preview/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg",
    "squareThumbnailUrl": "https://res.cloudinary.com/spot-boston/image/upload/t_square_thumbnail/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg",
    "tags": Array [
      "Close",
    ],
  },
]
`);
  });
});
