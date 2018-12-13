import { DetailedServiceRequest } from '../../Open311';

const REQUEST: DetailedServiceRequest = {
  id: '500r0000003ZbXFAA0',
  service_request_id: '200012223',
  status: 'open',
  long: -71.05780058965078,
  lat: 42.34875866930301,
  media_url: [
    {
      id: 'a0ir0000000och3AAA',
      url:
        'https://spot-boston-res.cloudinary.com/image/upload/v1536263504/boston/development/ummgik6x8d6as2gh7mtg.png',
      tags: ['Create'],
    },
  ],
  service_name: 'Trash or recycling not collected',
  service_code: 'MTRECYDBI',
  description: null,
  requested_datetime: '2018-09-06T19:51:48.000Z',
  expected_datetime: '2018-09-07T19:51:48.000Z',
  updated_datetime: '2018-09-06T19:51:51.000Z',
  address: '185 Kneeland St, Boston',
  zipcode: '02111',
  address_id: '82310',
  agency_responsible: null,
  service_notice: null,
  status_notes: null,
  origin: 'API',
  source: 'Web Portal',
  priority: 'Standard',
  service_level_agreement: {
    type: 24,
    value: 'Hours',
  },
  address_details: null,
  duplicate_parent_service_request_id: null,
  parent_service_request_id: null,
  reported_location: {
    address: null,
    address_id: null,
    lat: 42.34788778389048,
    long: -71.05751037597658,
  },
  owner: {
    id: '00Gr0000000XAOyEAO',
    name: 'PWD Missd Trash-Recycle-Yard Waste-Bulk',
    type: 'queue',
  },
  contact: {
    first_name: 'Strong',
    last_name: 'Bad',
    phone: null,
    email: 'strongbad@homestarrunner.com',
  },
  closure_details: {
    reason: null,
    comment: null,
  },
  attributes: [
    {
      code: 'PWD-CURBORALLEY',
      description: 'Is your trash curbside pickup or an alley?',
      order: 1,
      values: [],
    },
    {
      code: 'SR-MTRECYDBI1',
      description: 'What type of trash collection was missed?',
      order: 2,
      values: [
        {
          answer: 'Bulk Item',
          answer_value: 'Bulk Item',
        },
      ],
    },
    {
      code: 'ITMPCKUP',
      description: 'Which item(s) was/were supposed to be picked up?',
      order: 3,
      values: [
        {
          answer: 'Refrigerator or Freezer',
          answer_value: 'Refrigerator or Freezer',
        },
      ],
    },
    {
      code: 'REC-TRASHDAYINC',
      description: 'Incorrect trash/recycle day:',
      order: 4,
      values: [],
    },
  ],
  activities: [
    {
      code: 'MTRECYDBI-INSP',
      order: 1,
      description: null,
      status: 'Not Started',
      completion_date: null,
    },
    {
      code: 'MTRECYDBI-REINSP',
      order: 2,
      description: null,
      status: 'Not Started',
      completion_date: null,
    },
  ],
  events: [
    {
      type: 'Update',
      event_by: {
        type: 'user',
        id: '005r0000001NDt0AAG',
        name: 'Digital Web Portal',
      },
      event_datetime: '2018-09-06T19:51:51.000Z',
      notes: null,
    },
  ],
};

export default REQUEST;
