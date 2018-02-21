import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableOpacity  } from 'react-native';
import round from 'lodash/fp/round';
import { Card, CardItem, Text, Left, Body, Right } from 'native-base';
import getOr from 'lodash/fp/getOr';
import moment from 'moment';
import emptyCover from '../assets/emptyCover.png';


export default class Events extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  }


  handlePress = () => {
    this.cover.measureInWindow((x, y, width, height) =>
      this.props.onSelect(this.props.item, {
        left: x,
        top: y,
        width,
        height,
      }));
  }


  render() {
    const { item } = this.props;
    const cover = { uri: getOr(null, 'cover.source')(item) };
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={this.handlePress}>
        <Card style={{ zIndex: 0 }}>
          <CardItem cardBody>
            <Image
              ref={component => this.cover = component}
              source={cover.uri ? cover : emptyCover}
              style={{ height: 150, width: null, flex: 1 }}
            />
          </CardItem>
          <CardItem>
            <Left>
              <Body>
                <Text>{item.name}</Text>
              </Body>
            </Left>
            <Right>
              <Text>{moment(item.start_time).fromNow()}</Text>
              <Text>{round(item.distance)} km</Text>
            </Right>
          </CardItem>
        </Card>
      </TouchableOpacity>
    );
  }
}
