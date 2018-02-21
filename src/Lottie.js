import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { DangerZone } from 'expo';

const ExpoLottie = DangerZone.Lottie;
const animations = {
  search: require("../assets/animations/search.json"), //eslint-disable-line
  location: require("../assets/animations/location.json"), //eslint-disable-line
  nothing: require("../assets/animations/nothing.json"), //eslint-disable-line
};

export default class Lottie extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    style: PropTypes.object,
  }

  static defaultProps = {
    style: StyleSheet.create({}),
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      animation: null,
    };
  }

  componentWillMount() {
    this.playAnimation();
  }

  playAnimation = () => {
    if (!this.state.animation) {
      this.loadAnimationAsync();
    } else {
      this.animation.reset();
      this.animation.play();
    }
  };

  loadAnimationAsync = async () => {
    const result = animations[this.props.name];
    this.setState(
      { animation: result }, //eslint-disable-line
      this.playAnimation,
    );
  };


  render() {
    const { animation } = this.state;
    const { style } = this.props;
    return animation ?
      <ExpoLottie
        ref={(ref) => {
          this.animation = ref;
        }}
        style={style}
        source={animation}
      /> : <View />;
  }
}
