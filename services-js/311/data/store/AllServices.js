// @flow

import { observable } from 'mobx';

const GROUPS = [
  {
    name: 'Animals',
    id: 'Animal Control',
    description: 'Pet Ownership, Problems with Animals, Rodents & Pests',
  },
  {
    name: 'Business',
    id: 'business',
    description: 'Certificates & Registrations, Licensing & Permitting, Complaints, Business with the City',
  },
  {
    name: 'Education & Employment',
    id: 'education-employment',
    description: 'City Jobs, Schools, Library Resources, Internships & Volunteering',
  },
  {
    name: 'Elections & Records',
    id: 'elections-records',
    description: 'Voting, Contact Elected Officials, Personal Records (e.g., Births, Deaths & Marriages)',
  },
  {
    name: 'Garbage, Recycling & Graffiti',
    id: 'garbage',
    description: 'Trash, Recycling, Graffiti, Dumping, Street Cleaning, Neighborhood Cleanup',
  },
  {
    name: 'Health, Safety & Social Services',
    id: 'Health - Safety',
    description: 'Crime, Fire Prevention & Control, Healthy Living & Inspections',
  },
  {
    name: 'Housing, Property & Construction',
    id: 'housing',
    description: 'Home Ownership, Renting, Inspections, Code Enforcement, Permitting, Complaints',
  },
  {
    name: 'Parks & Trees',
    id: 'parks',
    description: 'Park Maintenance, Permits, Tree Planting, Donations',
  },
  {
    name: 'Recreation, Entertainment & Event Planning',
    id: 'entertainment',
    description: 'Calendar, Event Permitting, Facility Request, Youth, Arts',
  },
  {
    name: 'Taxes & Payments',
    id: 'taxes',
    description: 'Real Estate Tax, Boat and Motor Vehicle Excise, Personal Property',
  },
  {
    name: 'Transportation, Streets & Sidewalks',
    id: 'transportation',
    description: 'Signs & Signals, Parking, Driving, Public Transportation, Taxi Issues, Road Maintenance',
  },
  {
    name: 'Utilities',
    id: 'utilities',
    description: 'Water & Sewer, Electric, Gas, Heat',
  },
];

export class Group {
  name: string;
  id: string;
  description: string;

  @observable open: boolean = false;

  constructor({ name, id, description }: { name: string, id: string, description: string}) {
    this.name = name;
    this.id = id;
    this.description = description;
  }
}

/* This is kept in the store so that clicking "back" to the page keeps the
   categories open. */
export default class AllServices {
  groups: Group[] = GROUPS.map((g) => new Group(g));
  otherGroup: Group = new Group({
    name: 'Other Services',
    id: '',
    description: 'These services have not yet been categorized',
  })
}
