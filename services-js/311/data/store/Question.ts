import { observable, computed } from 'mobx';

import { ServiceAttributeDatatype } from '../queries/types';
import { ServiceAttribute } from '../types';

import ConditionGroup from './ConditionGroup';

type ValuesArray = Array<{
  key: string;
  name: string;
}>;

type ConditionGroupValidation = {
  conditions: ConditionGroup;
  message: string;
  reportOnly: boolean;
};

type ConditionalValuesArray = Array<{
  conditions: ConditionGroup;
  values: ValuesArray;
}>;

export default class Question {
  code: string;
  description: string;
  required: boolean;
  type: ServiceAttributeDatatype;
  @observable malformed: boolean;
  _values: ValuesArray | null;
  _validations: Array<ConditionGroupValidation>;
  _conditionalValues: ConditionalValuesArray | null;
  _dependencies: ConditionGroup | null;
  @observable value: string | Array<string> | null;

  static buildQuestions(attributes: ServiceAttribute[]): Question[] {
    const questionMap = {};
    return attributes.map(attr => {
      const question = new Question(attr, questionMap);
      questionMap[question.code] = question;
      return question;
    });
  }

  constructor(
    attribute: ServiceAttribute,
    questionMap: { [code: string]: Question } = {}
  ) {
    // Used for validation, where questions need to refer to themselves.
    // Allowing this for conditions or dependencies could cause infinite loops.
    const selfReferencingQuestionMap = {
      ...questionMap,
      [attribute.code]: this,
    };

    this.code = attribute.code;
    this.description = attribute.description;
    this.required = attribute.required;
    this.malformed = false;
    this._validations = attribute.validations.map(
      ({ dependentOn, message, reportOnly }) => ({
        conditions: new ConditionGroup(dependentOn, selfReferencingQuestionMap),
        message,
        reportOnly,
      })
    );
    this._values = attribute.values;
    this._conditionalValues = (attribute.conditionalValues || []).map(
      ({ dependentOn, values }) => ({
        conditions: new ConditionGroup(dependentOn, questionMap),
        values,
      })
    );
    this._dependencies = attribute.dependencies
      ? new ConditionGroup(attribute.dependencies, questionMap)
      : null;
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
  get requirementsMet(): boolean {
    if (this.malformed) {
      return false;
    }

    if (
      this.failingValidations.filter(({ reportOnly }) => !reportOnly).length > 0
    ) {
      return false;
    }

    const { safeValue } = this;
    return Array.isArray(safeValue) ? !!safeValue.length : !!safeValue;
  }

  @computed
  get validationErrorMessages(): Array<string> {
    return this.failingValidations
      .filter(({ reportOnly }) => !reportOnly)
      .map(({ message }) => message);
  }

  @computed
  get validationInfoMessages(): Array<string> {
    return this.failingValidations
      .filter(({ reportOnly }) => reportOnly)
      .map(({ message }) => message);
  }

  @computed
  get valueOptions(): ValuesArray | null {
    const { _values: values, _conditionalValues: conditionalValues } = this;

    if (!values || !conditionalValues) {
      return null;
    }

    let out = [...values];

    conditionalValues
      .filter(({ conditions }) => conditions.holds)
      .map(({ values: activeValues }) => activeValues)
      .forEach(arr => (out = out.concat(arr)));

    return out;
  }

  // Filters value down to the string or array that matches the values allowed
  // in the options for single/multi pick lists.
  //
  // Result still may not be legal according to the validations, however.
  @computed
  get safeValue(): string | string[] | null {
    if (!this.visible) {
      return null;
    }

    const value = this.value ? this.value.slice() : null;
    const valueOptions = this.valueOptions;

    if (!valueOptions) {
      return value;
    } else if (Array.isArray(value)) {
      return value.filter(v => !!valueOptions.find(({ key }) => key === v));
    } else {
      return valueOptions.find(({ key }) => key === value) ? value : null;
    }
  }

  @computed
  get hasSafeValue(): boolean {
    const { safeValue } = this;
    if (Array.isArray(safeValue)) {
      return safeValue.length > 0;
    } else {
      return !!safeValue;
    }
  }

  @computed
  get failingValidations(): Array<ConditionGroupValidation> {
    if (!this.hasSafeValue) {
      return [];
    }

    return this._validations.filter(({ conditions }) => !conditions.holds);
  }
}
