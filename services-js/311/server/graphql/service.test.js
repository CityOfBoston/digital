// @flow

import { filterPlainValues, filterConditionalValues } from './service';

describe('filterPlainValues', () => {
  it('returns null for null', () => {
    expect(filterPlainValues(null)).toEqual(null);
  });

  it('returns values', () => {
    expect(
      filterPlainValues([
        {
          key: 'Dog',
          name: 'Dog',
        },
        {
          key: 'Bat',
          name: 'Bat',
        },
        {
          key: 'Bear',
          name: 'Bear',
        },
      ])
    ).toEqual([
      {
        key: 'Dog',
        name: 'Dog',
      },
      {
        key: 'Bat',
        name: 'Bat',
      },
      {
        key: 'Bear',
        name: 'Bear',
      },
    ]);
  });

  it('removes dependentOn', () => {
    expect(
      filterPlainValues([
        {
          dependentOn: {
            clause: 'OR',
            conditions: [
              {
                attribute: 'SR-ANMLGEN1',
                op: 'eq',
                value: 'Vicious/Aggressive',
              },
            ],
          },
          values: [
            {
              key: 'Dog',
              name: 'Dog',
              img: '',
            },
            {
              key: 'Bat',
              name: 'Bat',
              img: '',
            },
            {
              key: 'Bear',
              name: 'Bear',
              img: '',
            },
          ],
        },
      ])
    ).toEqual([]);
  });
});

describe('filterConditionalValues', () => {
  it('returns null for null', () => {
    expect(filterConditionalValues(null)).toEqual(null);
  });

  it('removes plain values', () => {
    expect(
      filterConditionalValues([
        {
          key: 'Dog',
          name: 'Dog',
        },
        {
          key: 'Bat',
          name: 'Bat',
        },
        {
          key: 'Bear',
          name: 'Bear',
        },
      ])
    ).toEqual([]);
  });

  it('returns dependentOn', () => {
    expect(
      filterConditionalValues([
        {
          dependentOn: {
            clause: 'OR',
            conditions: [
              {
                attribute: 'SR-ANMLGEN1',
                op: 'eq',
                value: 'Vicious/Aggressive',
              },
            ],
          },
          values: [
            {
              key: 'Dog',
              name: 'Dog',
              img: '',
            },
            {
              key: 'Bat',
              name: 'Bat',
              img: '',
            },
            {
              key: 'Bear',
              name: 'Bear',
              img: '',
            },
          ],
        },
      ])
    ).toEqual([
      {
        dependentOn: {
          clause: 'OR',
          conditions: [
            {
              attribute: 'SR-ANMLGEN1',
              op: 'eq',
              value: 'Vicious/Aggressive',
            },
          ],
        },
        values: [
          {
            key: 'Dog',
            name: 'Dog',
            img: '',
          },
          {
            key: 'Bat',
            name: 'Bat',
            img: '',
          },
          {
            key: 'Bear',
            name: 'Bear',
            img: '',
          },
        ],
      },
    ]);
  });
});
