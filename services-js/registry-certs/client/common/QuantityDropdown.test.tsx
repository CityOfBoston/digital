import React from 'react';
import { mount } from 'enzyme';

import QuantityDropdown from './QuantityDropdown';

describe('QuantityDropdown', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <QuantityDropdown quantity={1} handleQuantityChange={jest.fn()} />
    );
  });

  it('Changes input field quantity when dropdown is used', () => {
    const quantityField = wrapper.find('input');
    const quantityMenu = wrapper.find('select');

    const newValue = '5';

    expect(quantityField.props().value).toEqual(1);

    quantityMenu.simulate('change', { target: { value: newValue } });

    wrapper.update();

    const updatedQuantityField = wrapper.find('select');

    expect(updatedQuantityField.props().value).toEqual(newValue);
  });

  it('Changes select value when user types a new value in the input field', () => {
    const quantityField = wrapper.find('input');
    const quantityMenu = wrapper.find('select');

    const newValue = '5';

    expect(quantityMenu.props().value).toBe('1');

    quantityField.simulate('change', { target: { value: newValue } });

    wrapper.update();

    const updatedQuantityMenu = wrapper.find('select');

    expect(updatedQuantityMenu.props().value).toEqual(newValue);
  });

  it('Changes select value to “other” if a value greater than 10 is typed in the field input', () => {
    const quantityField = wrapper.find('input');
    const quantityMenu = wrapper.find('select');

    expect(quantityMenu.props().value).toBe('1');

    quantityField.simulate('change', { target: { value: '13' } });

    wrapper.update();

    const updatedQuantityMenu = wrapper.find('select');

    expect(updatedQuantityMenu.props().value).toEqual('other');
  });

  it('Moves focus to field input and clear value when “other” is selected in dropdown', () => {
    const quantityField = wrapper.find('input');
    const quantityMenu = wrapper.find('select');

    quantityField.displayName = 'QuantityField';

    expect(quantityField.props().value).toBe(1);

    quantityMenu.simulate('change', { target: { value: 'other' } });

    wrapper.update();

    // @ts-ignore
    expect(document.activeElement.getAttribute('name')).toEqual(
      quantityField.props().name
    );
  });
});
