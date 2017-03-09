// @flow

import { observable, computed } from 'mobx';
import type { ObservableArray } from 'mobx';

import type { ServiceMetadataAttributeDatatype } from '../graphql/schema.flow';
import type { ServiceMetadataAttribute } from '../types';

import ConditionGroup from './ConditionGroup';

type ValuesArray = Array<{
  key: string,
  name: string,
}>;

type ConditionalValuesArray = Array<{|
  conditions: ConditionGroup,
  values: ValuesArray,
|}>;

export default class Question {
  code: string;
  description: string;
  required: boolean;
  type: ServiceMetadataAttributeDatatype;
  _values: ?ValuesArray;
  _conditionalValues: ?ConditionalValuesArray;
  _dependencies: ?ConditionGroup;
  @observable value: ?string | ObservableArray<string>;

  static buildQuestions(attributes: ServiceMetadataAttribute[]): Question[] {
    const questionMap = {};
    return attributes.map((attr) => {
      const question = new Question(attr, questionMap);
      questionMap[question.code] = question;
      return question;
    });
  }

  constructor(attribute: ServiceMetadataAttribute, questionMap: {[code: string]: Question} = {}) {
    this.code = attribute.code;
    this.description = attribute.description;
    this.required = attribute.required;
    this._values = attribute.values;
    this._conditionalValues = (attribute.conditionalValues || []).map(({ dependentOn, values }) => ({
      conditions: new ConditionGroup(dependentOn, questionMap),
      values,
    }));
    this._dependencies = attribute.dependencies ? new ConditionGroup(attribute.dependencies, questionMap) : null;
    this.type = attribute.type;

    switch (this.type) {
      case 'SINGLEVALUELIST':
        this.value = null;
        break;

      case 'MULTIVALUELIST':
        this.value = [];
        break;

      default:
        this.value = '';
        break;
    }
  }

  @computed
  get visible(): boolean {
    return !this._dependencies || this._dependencies.holds;
  }

  @computed
  get valueOptions(): ?ValuesArray {
    const { _values: values, _conditionalValues: conditionalValues } = this;

    if (!values || !conditionalValues) {
      return null;
    }

    const activeValuesArr = conditionalValues
      .filter(({ conditions }) => conditions.holds)
      .map(({ values: activeValues }) => activeValues);
    return [...values, ...([].concat(...activeValuesArr))];
  }

  @computed
  get validatedValue(): ?string | string[] {
    if (!this.visible) {
      return null;
    }

    const value = this.value ? this.value.slice() : null;
    const valueOptions = this.valueOptions;

    if (!valueOptions) {
      return value;
    } else if (Array.isArray(value)) {
      return value.filter((v) => !!valueOptions.find(({ key }) => key === v));
    } else {
      return valueOptions.find(({ key }) => key === value) ? value : null;
    }
  }
}
