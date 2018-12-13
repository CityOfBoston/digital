import { ServiceMetadata } from '../../Open311';

const METADATA: ServiceMetadata[] = [
  {
    service_code: 'BOS311GEN',
    attributes: [],
    service_name: 'General request',
    description: "Can't find the right category? Make your request here.",
    activities: [],
    definitions: {
      contact_required: false,
      location_required: false,
      location: {
        required: false,
        visible: true,
      },
      service_departments: [
        {
          code: 'COB_MAYOR_CALLCTR',
          name: "Mayor's Office-311 Call Center",
          phone: null,
          email: null,
          web_link: null,
        },
      ],
      service_categories: [
        {
          code: 'Other',
          name: 'Other',
          description: 'Other General Request',
        },
      ],
      reporter: {
        required: false,
        visible: true,
        required_fields: null,
      },
      icons: {
        service_icon: null,
        map_marker: null,
      },
      recommendations: null,
      validations: {
        geographical: null,
        messages: null,
        alerts: null,
      },
    },
    service_level_agreement: {
      type: null,
      value: null,
    },
  },
  {
    service_code: 'BIRDINFEST',
    attributes: [
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 1,
        description: 'Any evidence of roosting?',
        code: 'SR-BIRDINFEST1',
        variable: true,
        values: [
          {
            key: 'Yes',
            name: 'Yes',
          },
          {
            key: 'No',
            name: 'No',
          },
        ],
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 2,
        description: 'Location of birds',
        code: 'SR-BIRDINFEST2',
        variable: true,
        values: [
          {
            key: 'Roof',
            name: 'Roof',
          },
          {
            key: 'Sidewalk',
            name: 'Sidewalk',
          },
          {
            key: 'Power Lines',
            name: 'Power Lines',
          },
          {
            key: 'Other',
            name: 'Other',
          },
        ],
      },
      {
        required: false,
        datatype: 'string',
        datatype_description: 'Please describe if "other" or "unknown".',
        order: 3,
        description: 'If other, please specify',
        code: 'ST-OTHER',
        variable: true,
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-BIRDINFEST2',
              op: 'eq',
              value: 'Other',
            },
          ],
        },
      },
    ],
    service_name: 'Bird infestation',
    description:
      'Report a bird infestation in a public place. You should see a lot of bird droppings in the area.',
    activities: [],
    definitions: {
      contact_required: false,
      location_required: true,
      location: {
        required: true,
        visible: true,
      },
      service_departments: [
        {
          code: 'COB_ISD_ENVR',
          name: 'ISD-Environment',
          phone: null,
          email: null,
          web_link: null,
        },
      ],
      service_categories: [
        {
          code: 'Animals',
          name: 'Animals',
          description: 'Animals in BOS311',
        },
      ],
      reporter: {
        required: false,
        visible: true,
        required_fields: null,
      },
      icons: {
        service_icon: null,
        map_marker: null,
      },
      recommendations: null,
      validations: {
        geographical: null,
        messages: null,
        alerts: null,
      },
    },
    service_level_agreement: {
      type: 'Calendar Days',
      value: 30,
    },
  },
  {
    service_code: 'CEMTRYMAIN',
    attributes: [
      {
        required: true,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 1,
        description: 'What is the issue?',
        code: 'SR-CEMTRYMAIN1',
        variable: true,
        values: [
          {
            key: 'Loaming',
            name: 'Loaming',
          },
          {
            key: 'Seeding',
            name: 'Seeding',
          },
          {
            key: 'Cleaning',
            name: 'Cleaning',
          },
          {
            key: 'Opening Gates',
            name: 'Opening Gates',
          },
          {
            key: 'Vandalized Headstone',
            name: 'Vandalized Headstone',
          },
          {
            key: 'Genealogy Request',
            name: 'Genealogy Request',
          },
          {
            key: 'Other',
            name: 'Other',
          },
        ],
      },
      {
        required: true,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 2,
        description: 'Which cemetery are you calling about?',
        code: 'SR-CEMTRYMAIN5',
        variable: true,
        values: [
          {
            key: 'Mount Hope Cemetery [ Mattapan]',
            name: 'Mount Hope Cemetery [ Mattapan]',
          },
          {
            key: 'Fairview Cemetery [ Hyde Park]',
            name: 'Fairview Cemetery [ Hyde Park]',
          },
          {
            key: 'Evergreen Cemetery [ Brighton]',
            name: 'Evergreen Cemetery [ Brighton]',
          },
          {
            key: 'Granary Burial Ground [Downtown Boston]',
            name: 'Granary Burial Ground [Downtown Boston]',
          },
          {
            key: 'Central Burial Ground [Downtown Boston]',
            name: 'Central Burial Ground [Downtown Boston]',
          },
          {
            key: 'Dorchester North Burial Ground [ Dorchester]',
            name: 'Dorchester North Burial Ground [ Dorchester]',
          },
          {
            key: 'Dorchester South Burial Ground [ Dorchester]',
            name: 'Dorchester South Burial Ground [ Dorchester]',
          },
          {
            key: 'Westerly Burial Ground [ West Roxbury]',
            name: 'Westerly Burial Ground [ West Roxbury]',
          },
          {
            key: 'Walter Street Cemetery [ Jamaica Plain]',
            name: 'Walter Street Cemetery [ Jamaica Plain]',
          },
          {
            key: 'Market Street Cemetery [ Brighton]',
            name: 'Market Street Cemetery [ Brighton]',
          },
          {
            key: 'Hawes/Union Cemetery [ South Boston]',
            name: 'Hawes/Union Cemetery [ South Boston]',
          },
          {
            key: 'Elliot Street Cemetery [ Roxbury]',
            name: 'Elliot Street Cemetery [ Roxbury]',
          },
          {
            key: 'South End South Burial Ground [ South End]',
            name: 'South End South Burial Ground [ South End]',
          },
          {
            key: 'Bennington Street Cemetery [ East Boston]',
            name: 'Bennington Street Cemetery [ East Boston]',
          },
          {
            key: 'Bunker Hill Burying Ground [ Charlestown]',
            name: 'Bunker Hill Burying Ground [ Charlestown]',
          },
          {
            key: 'Phipps Street Burying Ground [ Charlestown]',
            name: 'Phipps Street Burying Ground [ Charlestown]',
          },
          {
            key: 'Kings Chapel [Downtown]',
            name: 'Kings Chapel [Downtown]',
          },
          {
            key: 'Copps Hill [North End]',
            name: 'Copps Hill [North End]',
          },
          {
            key: 'Union [South Boston]',
            name: 'Union [South Boston]',
          },
        ],
      },
    ],
    service_name: 'Cemetery needs maintenance',
    description: 'File a request to pick up trash or clean up a City cemetery.',
    activities: [],
    definitions: {
      contact_required: false,
      location_required: true,
      location: {
        required: true,
        visible: true,
      },
      service_departments: [
        {
          code: 'COB_PARKS_CEM',
          name: 'Parks & Recreation-Cemetary',
          phone: null,
          email: null,
          web_link: null,
        },
      ],
      service_categories: [
        {
          code: 'Parks',
          name: 'Parks',
          description: 'Parks in BOS311',
        },
      ],
      reporter: {
        required: false,
        visible: true,
        required_fields: null,
      },
      icons: {
        service_icon: null,
        map_marker: null,
      },
      recommendations: null,
      validations: {
        geographical: null,
        messages: null,
        alerts: null,
      },
    },
    service_level_agreement: {
      type: 'Business Days',
      value: 5,
    },
  },
  {
    service_code: 'MTRECYDBI',
    attributes: [
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 1,
        description: 'Is your trash curbside pickup or an alley?',
        code: 'PWD-CURBORALLEY',
        variable: true,
        values: [
          {
            key: 'Curb Side Pickup',
            name: 'Curb Side Pickup',
          },
          {
            key: 'Alley',
            name: 'Alley',
          },
        ],
      },
      {
        required: false,
        datatype: 'informational',
        datatype_description: null,
        order: 2,
        description:
          'TRASH–household trash items. LEAF & YARD WASTE–leaves, weeds, grass, hedge trimmings, brush up to one inch in diameter and 3 feet in length. RECYCLING–paper, plastic, glass and metal. BULK ITEMS–refrigerators, computer monitors, air conditioners, televisions, water coolers, and dehumidifiers.',
        code: 'TRSHHHITMS',
        variable: false,
      },
      {
        required: true,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 3,
        description: 'What type of trash collection was missed?',
        code: 'SR-MTRECYDBI1',
        variable: true,
        values: [
          {
            key: 'Trash',
            name: 'Trash',
          },
          {
            key: 'Leaf and Yard Waste',
            name: 'Leaf and Yard Waste',
          },
          {
            key: 'Recycling',
            name: 'Recycling',
          },
          {
            key: 'Bulk Item',
            name: 'Bulk Item',
          },
          {
            key: 'Christmas Tree',
            name: 'Christmas Tree',
          },
        ],
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 4,
        description:
          'Does the trash contain any construction material, paints, plumbing fixtures or tires?',
        code: 'CNSTRCT_MTRL',
        variable: true,
        values: [
          {
            key: 'Yes',
            name: 'Yes',
          },
          {
            key: 'No',
            name: 'No',
          },
        ],
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI1',
              op: 'eq',
              value: 'Trash',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'string',
        datatype_description: null,
        order: 5,
        description: 'Please specify',
        code: 'ST-YES',
        variable: true,
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'CNSTRCT_MTRL',
              op: 'eq',
              value: 'Yes',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 6,
        description: 'How was your trash placed out for collection?',
        code: 'REC-TRSCOL',
        variable: true,
        values: [
          {
            key: 'Barrel',
            name: 'Barrel',
          },
          {
            key: 'Trash Bag',
            name: 'Trash Bag',
          },
          {
            key: 'Trash cart',
            name: 'Trash cart',
          },
          {
            key: 'Container',
            name: 'Container',
          },
          {
            key: 'Other',
            name: 'Other',
          },
        ],
        dependencies: {
          clause: 'AND',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI1',
              op: 'eq',
              value: 'Trash',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 7,
        description: 'Please specify the size of the barrel:',
        code: 'REC-BARLSIZE',
        variable: true,
        values: [
          {
            key: '32',
            name: '32',
          },
          {
            key: '55',
            name: '55',
          },
          {
            key: '65',
            name: '65',
          },
        ],
        dependencies: {
          clause: 'AND',
          conditions: [
            {
              attribute: 'REC-TRSCOL',
              op: 'eq',
              value: 'Barrel',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: 'Please select all that apply.',
        order: 8,
        description: 'How was your waste placed out for collection?',
        code: 'WSTEPLCE',
        variable: true,
        values: [
          {
            key: 'Yard Waste Paper Bag',
            name: 'Yard Waste Paper Bag',
          },
          {
            key: 'Barrel',
            name: 'Barrel',
          },
          {
            key: 'Bundles',
            name: 'Bundles',
          },
          {
            key: 'Other',
            name: 'Other',
          },
        ],
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI1',
              op: 'eq',
              value: 'Leaf and Yard Waste',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'string',
        datatype_description: 'Please describe if "other" or "unknown".',
        order: 9,
        description: 'If other, please specify',
        code: 'ST-OTHER',
        variable: true,
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'WSTEPLCE',
              op: 'eq',
              value: 'Other',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 10,
        description: 'Are the barrels or bags over 50 lbs?',
        code: 'SR-MTRECYDBI7',
        variable: true,
        values: [
          {
            key: 'Yes',
            name: 'Yes',
          },
          {
            key: 'No',
            name: 'No',
          },
        ],
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'WSTEPLCE',
              op: 'eq',
              value: 'Barrel',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'informational',
        datatype_description: null,
        order: 11,
        description: 'Barrels or Bags cannot exceed 50 lbs.',
        code: 'BRLS-BGS',
        variable: false,
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI7',
              op: 'eq',
              value: 'Yes',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 12,
        description:
          'Was brush tied in manageable bundles no longer than 3 feet?',
        code: 'SR-MTRECYDBI8',
        variable: true,
        values: [
          {
            key: 'Yes',
            name: 'Yes',
          },
          {
            key: 'No',
            name: 'No',
          },
        ],
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'WSTEPLCE',
              op: 'eq',
              value: 'Bundles',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'informational',
        datatype_description: null,
        order: 13,
        description:
          'Brush tied in manageable bundles should be no longer than 3 feet and 1 inch diameter. See KB.',
        code: 'BRSH-BNDLES',
        variable: false,
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI8',
              op: 'eq',
              value: 'No',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 14,
        description: 'Is your yard waste mixed with household trash?',
        code: 'YRDWSTEMIX2',
        variable: true,
        values: [
          {
            key: 'Yes',
            name: 'Yes',
          },
          {
            key: 'No',
            name: 'No',
          },
        ],
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI1',
              op: 'eq',
              value: 'Leaf and Yard Waste',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'informational',
        datatype_description: null,
        order: 15,
        description:
          "If 'Yes', then this needs to be treated as regular trash. Click 'Back', and select 'Trash' from the drop-down box.",
        code: 'IFYESTRSH',
        variable: false,
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'YRDWSTEMIX2',
              op: 'eq',
              value: 'Yes',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'singlevaluelist',
        datatype_description: null,
        order: 16,
        description: 'How was your recycling placed out for collection?',
        code: 'RCYCLCLCT',
        variable: true,
        values: [
          {
            key: 'Clear Plastic Bag',
            name: 'Clear Plastic Bag',
          },
          {
            key: 'Blue Box',
            name: 'Blue Box',
          },
          {
            key: 'Cart',
            name: 'Cart',
          },
          {
            key: 'Other',
            name: 'Other',
          },
        ],
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI1',
              op: 'eq',
              value: 'Recycling',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'text',
        datatype_description: null,
        order: 17,
        description: 'If other, please specify:',
        code: 'ST-OTHER2',
        variable: true,
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'RCYCLCLCT',
              op: 'eq',
              value: 'Other',
            },
          ],
        },
      },
      {
        required: false,
        datatype: 'multivaluelist',
        datatype_description: null,
        order: 18,
        description: 'Which item(s) was/were supposed to be picked up?',
        code: 'ITMPCKUP',
        variable: true,
        values: [
          {
            key: 'Air Conditioner',
            name: 'Air Conditioner',
          },
          {
            key: 'Computer Monitor',
            name: 'Computer Monitor',
          },
          {
            key: 'Dehumidifier',
            name: 'Dehumidifier',
          },
          {
            key: 'Refrigerator or Freezer',
            name: 'Refrigerator or Freezer',
          },
          {
            key: 'Water Cooler',
            name: 'Water Cooler',
          },
          {
            key: 'TV',
            name: 'TV',
          },
        ],
        dependencies: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-MTRECYDBI1',
              op: 'eq',
              value: 'Bulk Item',
            },
          ],
        },
      },
    ],
    service_name: 'Trash or recycling not collected',
    description:
      "We'll make a pickup if your items were placed out before 7 a.m. on the morning of your collection day, but we didn't pick them up.",
    activities: [],
    definitions: {
      contact_required: false,
      location_required: true,
      location: {
        required: true,
        visible: true,
      },
      service_departments: [
        {
          code: 'COB_PWD_SANI',
          name: 'PWD-Sanitation',
          phone: null,
          email: null,
          web_link: null,
        },
      ],
      service_categories: [
        {
          code: 'Litter',
          name: 'Litter',
          description: 'Litter and Trash 311',
        },
      ],
      reporter: {
        required: false,
        visible: true,
        required_fields: null,
      },
      icons: {
        service_icon: null,
        map_marker: null,
      },
      recommendations: null,
      validations: {
        geographical: null,
        messages: null,
        alerts: null,
      },
    },
    service_level_agreement: {
      type: 'Hours',
      value: 24,
    },
  },
];

export default METADATA;
