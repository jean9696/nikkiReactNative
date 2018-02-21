import React, { Component } from 'react';
import Events from './Events';

export default class Router extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentComponent: Events,
    };
  }

  handleChangeComponent = currentComponent => this.setState({ currentComponent });

  render() {
    const CurrentComponent = this.state.currentComponent;
    return <CurrentComponent {...this.props} changeRoute={this.handleChangeComponent} />;
  }
}
