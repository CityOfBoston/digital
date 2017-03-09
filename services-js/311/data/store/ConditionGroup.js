// @flow

import { computed } from 'mobx';

import type { ServiceMetadataAttributeConditionalClause } from '../graphql/schema.flow';
import type { ServiceMetadataAttributeValuesConditionSet } from '../types';

import type Question from './Question';
import Condition from './Condition';

export default class ConditionGroup {
  clause: ServiceMetadataAttributeConditionalClause;
  conditions: Condition[];

  constructor({ clause, conditions }: ServiceMetadataAttributeValuesConditionSet, questionMap: {[code: string]: Question}) {
    this.clause = clause;
    this.conditions = conditions.map((c) => new Condition(c, questionMap));
  }

  @computed
  get holds(): boolean {
    // number of conditions that must be true for us to be true
    const minConditions = this.clause === 'AND' ? this.conditions.length : 1;
    return this.conditions.filter((c) => c.holds).length >= minConditions;
  }
 }
