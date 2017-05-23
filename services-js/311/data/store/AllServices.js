// @flow

import { observable } from 'mobx';

const GROUPS = [
  {
    name: 'Animals',
    id: 'Animals',
    description: 'Pet Ownership, Problems with Animals, Rodents & Pests',
  },
  {
    name: 'Health, Safety, and Social Services',
    id: 'Health, Safety, and Social Services',
    description: 'Crime, Fire Prevention & Control, Healthy Living & Inspections',
  },
  {
    name: 'Parks and Public Space',
    id: 'Parks and Public Space',
    description: 'Park Maintenance, Permits, Tree Planting, Donations',
  },
  {
    name: 'Property, Housing and Construction',
    id: 'Property, Housing and Construction',
    description: 'Home Ownership, Renting, Inspections, Code Enforcement, Permitting, Complaints',
  },
  {
    name: 'Snow or Weather Related Concerns',
    id: 'Snow or Weather Related Concerns',
    description: 'Plowing, snow removal',
  },
  {
    name: 'Streets, Sidewalks, Traffic, and Vehicles',
    id: 'Streets, Sidewalks, Traffic, and Vehicles',
    description: 'Signs & Signals, Parking, Driving, Public Transportation, Taxi Issues, Road Maintenance',
  },
  {
    name: 'Trash, Recycling, and Graffiti',
    id: 'Trash, Recycling, and Graffiti',
    description: 'Trash, Recycling, Graffiti, Dumping, Street Cleaning, Neighborhood Cleanup',
  },
  {
    name: 'Other Services',
    id: 'Other',
    description: 'General service requests that don’t fit in another category',
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
    name: 'Uncategorized Services',
    id: '',
    description: 'These services have not yet been categorized',
  })
}
