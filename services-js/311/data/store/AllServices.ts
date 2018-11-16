import { observable } from 'mobx';

const GROUPS = [
  {
    name: 'Animals',
    id: 'Animals',
    description:
      'Help for pet owners, or issues with animals, rodents, and pests.',
  },
  {
    name: 'Fees and pricing',
    id: 'Fees-Pricing',
    description:
      'Have an issue with the price or measurement of gas, oil, or another product?',
  },
  {
    name: 'Food, restaurants, and eateries',
    id: 'Food',
    description:
      'You can report issues you see at restaurants and other eateries in the City.',
  },
  {
    name: 'Health, safety, and social services',
    id: 'Health-Safety',
    description:
      'Get help for a public safety or disability issue, or request a health inspection.',
  },
  {
    name: 'Parks and public space',
    id: 'Parks-Public',
    description:
      'File requests for repairs, permits, tree plantings, and even make donations.',
  },
  {
    name: 'Property, housing, and construction',
    id: 'Property-Construction',
    description:
      'We offer help to developers, homeowners, and renters on many issues.',
  },
  {
    name: 'Schools',
    id: 'Schools',
    description:
      'Have a problem with a City school bus? Want to see something repaired at a school?',
  },
  {
    name: 'Snow or weather-related concerns',
    id: 'Snow',
    description:
      'Request a plow, ask for a space saver to be removed, or report an unshoveled sidewalk.',
  },
  {
    name: 'Streets and sidewalks',
    id: 'Streets-Sidewalks',
    description:
      'You can report issues with street signs and signals, and road and sidewalk conditions.',
  },
  {
    name: 'Traffic and vehicles',
    id: 'Traffic-Vehicles',
    description:
      'We can help with requests about bikes, parking, accessible spots, and more.',
  },
  {
    name: 'Trash, recycling, and graffiti',
    id: 'Trash-Graffiti',
    description:
      'Do you need help with trash or recycling? Want us to clean up a part of the City?',
  },
  {
    name: 'Utilities',
    id: 'Utilities',
    description:
      'We can help if you have a problem with your electricity, water, or gas.',
  },
  {
    name: 'Other services',
    id: 'Other',
    description: 'General requests that don’t fit into a category.',
  },
];

export class Group {
  name: string;
  id: string;
  description: string;

  @observable open: boolean = false;

  constructor({
    name,
    id,
    description,
  }: {
    name: string;
    id: string;
    description: string;
  }) {
    this.name = name;
    this.id = id;
    this.description = description;
  }
}

/* This is kept in the store so that clicking "back" to the page keeps the
   categories open. */
export default class AllServices {
  groups: Group[] = GROUPS.map(g => new Group(g));
  otherGroup: Group = new Group({
    name: 'Uncategorized services',
    id: '',
    description: 'These services have not yet been categorized',
  });
}
