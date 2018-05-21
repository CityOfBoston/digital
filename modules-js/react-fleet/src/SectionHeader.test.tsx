import SectionHeader from './SectionHeader';

describe('rendering', () => {
  it('renders', () => {
    expect(
      new SectionHeader({ title: 'Boards and Commissions' }).render()
    ).toMatchSnapshot();
  });
});
