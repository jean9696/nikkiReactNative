import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlatList, StyleSheet, View, Dimensions, BackHandler, Image, Platform } from 'react-native';
import * as firebase from 'firebase';
import GeoFire from 'geofire';
import getOr from 'lodash/fp/getOr';
import find from 'lodash/fp/find';
import sortBy from 'lodash/fp/sortBy';
import moment from 'moment';
import { Header, Title, Left, Right, Body, Button, Icon, Text } from 'native-base';
import * as Animatable from 'react-native-animatable';
import Event from './Event';
import EventDetails from './EventDetails';
import Lottie from '../components/Lottie';
import PageSearch from '../pages/PageSearch';

const AnimatableHeader = Animatable.createAnimatableComponent(Header);
const AnimatableTitle = Animatable.createAnimatableComponent(Title);
const AnimatableFlatList = Animatable.createAnimatableComponent(FlatList);
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6136e8',
    zIndex: 200,
  },
  container: {
    flex: 1,
    paddingBottom: 0,
    height,
    backgroundColor: 'transparent',
  },
});

export default class Events extends Component {
  static propTypes = {
    location: PropTypes.arrayOf(PropTypes.number).isRequired,
    changeRoute: PropTypes.func.isRequired,
  }


  constructor(props, context) {
    super(props, context);
    this.state = {
      events: {},
      selectedEvent: null,
      coverPosition: {},
      detailsStyle: {},
      eventHeader: false,
      ready: false,
      currentCity: 'Nikki',
    };
    this.geoFireEnvents = new GeoFire(firebase.database().ref('geoFireEvents'));
  }

  componentWillMount() {
    setTimeout(() => this.setState({ ready: true }), 3000);
    this.getEvents();
    this.getAddress();
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.state.selectedEvent) {
        this.handleBack();
        return true;
      }
      return false;
    });
  }

  componentWillUnmount() {
    this.geoQuery.cancel();
  }

  getEvents = () => {
    const geoQuery = this.geoFireEnvents.query({
      center: this.props.location,
      radius: 20,
    });
    this.geoQuery = geoQuery.on('key_entered', (key, location, distance) => {
      return firebase.database().ref(`/events/${key}`).once('value').then((snapshot) => {
        const event = snapshot.val();
        if (event && moment().diff(moment(event.start_time)) < 0) {
          this.setState({
            events: {
              ...this.state.events,
              [key]: {
                ...event,
                distance,
              },
            },
          });
        }
        return true;
      });
    });
  }

  getAddress = () => {
    const request = new XMLHttpRequest();
    const method = 'GET';
    const url = `http://maps.googleapis.com/maps/api/geocode/json?latlng=${this.props.location[0]},${this.props.location[1]}&sensor=true`;
    const async = true;
    request.open(method, url, async);
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        if (request.status === 200) {
          const data = getOr({}, 'results[0]["address_components"]')(JSON.parse(request.responseText));
          const currentCityObject = find(c => getOr([], 'types')(c).indexOf('administrative_area_level_2') > -1)(data);
          const currentCity = getOr('Nikki', 'short_name')(currentCityObject);
          this.setState({ currentCity });
        }
      }
    };
    request.send();
  };


  handleSelect = (selectedEvent, coverPosition) => {
    this.setState({
      selectedEvent,
      coverPosition,
      detailsStyle: { opacity: 0, top: height },
      lastCoverPosition: coverPosition,
      eventHeaderPlain: Platform.OS === 'ios',
    }, () =>
      this.setState({
        coverPosition: {
          top: Platform.OS === 'ios' ? 65 : 0, height: 200, left: 0, width,
        },
        detailsStyle: {
          opacity: 1, top: Platform.OS === 'ios' ? 65 : 0, height: Platform.OS === 'ios' ? height - 65 : height, width,
        },
        eventHeader: true,
      }));
  }

  handleBack = () => {
    this.setState({
      coverPosition: this.state.lastCoverPosition,
      detailsStyle: { opacity: 0, top: height, width },
      eventHeader: false,
    });
    setTimeout(() => this.setState({ selectedEvent: null }), 400);
  }

  handleEventScroll = (event) => {
    if (Platform.OS !== 'ios') {
      if (event.nativeEvent.contentOffset.y > 120 && !this.state.eventHeaderPlain) {
        this.setState({ eventHeaderPlain: true });
      } else if (this.state.eventHeaderPlain && event.nativeEvent.contentOffset.y <= 120) {
        this.setState({ eventHeaderPlain: false });
      }
    }
  }

  handleAddPage = () => this.props.changeRoute(PageSearch);


  render() {
    const events = sortBy(e => e.start_time)(Object.values(this.state.events));
    const {
      selectedEvent, eventHeaderPlain, eventHeader, ready,
      coverPosition, detailsStyle, currentCity,
    } = this.state;
    return (
      <View style={styles.container}>
        {eventHeader ?
          <AnimatableHeader
            androidStatusBarColor="#4b28b7"
            iosBarStyle="light-content"
            transition="backgroundColor"
            style={{
              backgroundColor: eventHeaderPlain ? '#6136e8' : 'rgba(10, 10, 10, 0.2)',
              zIndex: 10,
              position: 'absolute',
              top: 0,
            }} noShadow
          >
            <Left>
              <Button transparent onPressIn={this.handleBack}>
                <Icon name="arrow-back" style={{ color: 'white' }} />
              </Button>
            </Left>
            <Body>
              <AnimatableTitle
                transition="opacity"
                style={{ opacity: eventHeaderPlain ? 1 : 0, color: 'white' }}
              >{getOr(null, 'name')(selectedEvent)}
              </AnimatableTitle>
            </Body>
            <Right />
          </AnimatableHeader> : <Header androidStatusBarColor="#4b28b7" iosBarStyle="light-content" style={styles.header}>
            <Left>
              <Image source={require('../../assets/logo.png')} style={{ height: 40, width: 40 }} />
            </Left>
            <Body>
              <Title style={{ color: 'white' }}>{currentCity}</Title>
            </Body>
            <Right>
              <Button transparent onPress={this.handleAddPage}>
                <Icon name="add" style={{ color: 'white' }} />
              </Button>
            </Right>
                                </Header >
        }
        <EventDetails
          selectedEvent={selectedEvent}
          onScroll={this.handleEventScroll}
          coverPosition={coverPosition}
          detailsStyle={detailsStyle} location={this.props.location}
        />
        <Animatable.View
          style={{
 height: Platform.OS === 'ios' ? height : height - 80, zIndex: 1, opacity: eventHeader ? 0 : 1, display: eventHeader && Platform.OS === 'ios' ? 'none' : 'flex',
}} transition="opacity"
        >
          {ready ? (
            <AnimatableFlatList
              removeClippedSubviews animation="fadeInUp"
              data={events} keyExtractor={e => e.id} ListEmptyComponent={() =>
                (<View style={{
 flex: 1, justifyContent: 'center', alignContent: 'center', marginTop: 50,
}}
                >
                  <Lottie name="nothing" style={{ height: 200 }} />
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>
                  Sorry we cannot find events nearby...
                  </Text>
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>
                    Help us by adding facebook pages to the Nikki database!
                  </Text>
                </View>)}
              renderItem={({ item }) => (<Event item={item} onSelect={this.handleSelect} />)}
            />
          ) : (
            <View style={{
 flex: 1,
}}
            >
              <Lottie style={{ width, height: 150, marginTop: 100 }} name="search" />
              <Text style={{ textAlign: 'center', color: '#6136e8', marginTop: Platform.OS === 'ios' ? 150 : 20 }}>Looking for event nearby</Text>
            </View>
          )}
        </Animatable.View>
      </View>
    );
  }
}
