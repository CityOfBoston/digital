import { computed } from 'mobx';

import { ServiceAttributeConditionalOp } from '../queries/types';
import { ServiceAttributeValuesCondition } from '../types';

import Question from './Question';

// Class to handle a condition of a dependent picklist or dependent question.
// Combined into a ConditionGroup with "AND" or "OR".
//
// A condition is based on the validated current value of a question (not the
// one that is depending on it) and its "holds" is either true or false.
//
// Uses validated value rather than the cached last set value so that e.g.
// nothing is equal to a hidden question’s value, regardless of what was filled
// in when it was visible.
export default class Condition {
  question: Question;
  operator: ServiceAttributeConditionalOp;
  value: string | string[] | number;

  constructor(
    { attribute, op, value }: ServiceAttributeValuesCondition,
    questionMap: { [code: string]: Question }
  ) {
    const question = questionMap[attribute];
    if (!question) {
      throw new Error(`Question not found for code: ${attribute}`);
    }

    this.question = question;
    this.operator = op;

    switch (value.type) {
      case 'NUMBER':
        if (value.number == null) {
          throw new Error(
            `Missing number from value: ${JSON.stringify(value)}`
          );
        }
        this.value = value.number;
        break;

      case 'STRING':
        if (value.string == null) {
          throw new Error(
            `Missing string from value: ${JSON.stringify(value)}`
          );
        }
        this.value = value.string;
        break;

      case 'STRING_ARRAY':
        if (value.array == null) {
          throw new Error(`Missing array from value: ${JSON.stringify(value)}`);
        }
        this.value = value.array;
        break;

      default:
        throw new Error(`Unknown value type: ${JSON.stringify(value.type)}`);
    }
  }

  @computed
  get holds(): boolean {
    switch (this.operator) {
      case 'eq':
        return this.conditionEq();
      case 'neq':
        return !this.conditionEq();
      case 'in':
        return this.conditionIn();
      case 'gt':
        return this.conditionNumericOp((a, b) => a > b);
      case 'gte':
        return this.conditionNumericOp((a, b) => a >= b);
      case 'lt':
        return this.conditionNumericOp((a, b) => a < b);
      case 'lte':
        return this.conditionNumericOp((a, b) => a <= b);
      default:
        return false;
    }
  }

  conditionEq(): boolean {
    const currentValue = this.question.safeValue;
    const { value } = this;

    if (typeof value === 'string') {
      return currentValue === value;
    } else if (typeof value === 'number') {
      return (
        typeof currentValue === 'string' && parseFloat(currentValue) === value
      );
    } else if (Array.isArray(value)) {
      if (!Array.isArray(currentValue)) {
        return false;
      } else {
        // Making copies since sort mutates
        const currentValueArr = [...currentValue].sort();
        const expectedValueArr = [...value].sort();

        // array equality!
        return (
          currentValueArr.length === expectedValueArr.length &&
          currentValueArr.filter((el, i) => el === expectedValueArr[i])
            .length === currentValueArr.length
        );
      }
    } else {
      return false;
    }
  }

  conditionIn(): boolean {
    const currentValue = this.question.safeValue;
    const { value } = this;

    if (!Array.isArray(currentValue) || Array.isArray(value)) {
      return false;
    }

    return currentValue.indexOf(value.toString()) !== -1;
  }

  conditionNumericOp(op: (a: number, b: number) => boolean): boolean {
    const currentValue = this.question.safeValue;
    const { value } = this;

    if (typeof value !== 'number' || typeof currentValue !== 'string') {
      return false;
    }

    const currentNumber = parseFloat(currentValue);
    return op(currentNumber, value);
  }
}
