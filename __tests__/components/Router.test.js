import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Router from '../../src/components/Router';

Enzyme.configure({ adapter: new Adapter() });

const MockComponent = () => <div>Mock</div>;

describe('Testing Router', () => {
  it('should render without crashing', () => {
    const wrapper = shallow(<Router location={[1, 1]} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should change component', () => {
    const wrapper = shallow(<Router location={[1, 1]} />);
    const instance = wrapper.instance();
    instance.handleChangeComponent(MockComponent);
    wrapper.update();
    expect(wrapper.type()).toEqual(MockComponent);
  });
});


