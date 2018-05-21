import MyComponent from './MyComponent';

describe('rendering', () => {
  it('renders', () => {
    expect(new MyComponent({}).render()).toMatchSnapshot();
  });
});
