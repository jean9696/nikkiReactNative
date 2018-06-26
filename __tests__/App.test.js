import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import * as firebase from 'firebase';
import Adapter from 'enzyme-adapter-react-16';
import App from '../App';

Enzyme.configure({ adapter: new Adapter() });

describe('Testing App rendering', () => {
  it('should render without crashing', () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe('Testing App initialization', () => {
  it('should init the location', async () => {
    const wrapper = shallow(<App />);
    const instance = wrapper.instance();
    await instance.getLocationAsync();
    expect(wrapper.state('location')).toEqual([1, 1]);
  });

  it('should log the user anonymously to firebase', async () => {
    const wrapper = shallow(<App />);
    const instance = wrapper.instance();
    await instance.loadAsync();
    expect(firebase.auth().currentUser).not.toBeNull();
  });
});

