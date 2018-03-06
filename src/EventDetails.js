import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import getOr from 'lodash/fp/getOr';
import { MapView } from 'expo';
import moment from 'moment';
import * as Animatable from 'react-native-animatable';
import { Button, Icon } from 'native-base';
import {
  StyleSheet, Image, Dimensions, ScrollView,
  View, Text, Linking, Share, TouchableWithoutFeedback
} from 'react-native';

const AnimatableImage = Animatable.createAnimatableComponent(Image);
const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  description: {
    paddingHorizontal: 10,
    paddingVertical: 50,
    borderTopWidth: 5,
    borderTopColor: '#ede7f6',
  },
  title: {
    fontSize: 22,
    padding: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#ede7f6',
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 5,
    borderBottomColor: '#ede7f6',
  },
  inlineInformation: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 4,
  },
  inlineInformationIcon: {
    color: '#9575CD',
    fontSize: 16,
    marginTop: 2,
    marginRight: 10,
  },
  actionButton: {
    width: width / 4,
    justifyContent: 'center',
    marginTop: 16,
  },
  informationContainer: {
    width: width * 0.75,
    paddingVertical: 10,
    paddingLeft: 20,
  },
  map: {
    flex: 1,
    height: 150,
    width,
  },
});

export default class EventDetails extends Component { //eslint-disable-line
  static propTypes = {
    selectedEvent: PropTypes.object,
    coverPosition: PropTypes.object.isRequired,
    detailsStyle: PropTypes.object.isRequired,
    onScroll: PropTypes.func.isRequired,
    location: PropTypes.arrayOf(PropTypes.number).isRequired,
  }

  static defaultProps = {
    selectedEvent: null,
  }

  getEventLocation = () => ({
    longitude: getOr(null, 'place.location.longitude')(this.props.selectedEvent),
    latitude: getOr(null, 'place.location.latitude')(this.props.selectedEvent),
  });

  getMyLocation = () => ({
    longitude: this.props.location[1],
    latitude: this.props.location[0],
  })

  handleCoverPress = () => {
    const { selectedEvent } = this.props;
    Linking.openURL(`https://www.facebook.com/events/${selectedEvent.id}`);
  }

  handleMapPress = () => {
    const { longitude, latitude } = this.getEventLocation();
    Linking.openURL(`http://maps.google.com/maps/?q=${latitude},${longitude}`);
  }

  handleShare = () => {
    const { selectedEvent } = this.props;
    Share.share({
      message: `${selectedEvent.name} ${moment(selectedEvent).fromNow()} --- https://www.facebook.com/events/${selectedEvent.id}`,
      url: `https://www.facebook.com/events/${selectedEvent.id}`,
      title: 'Hey look at this event ! Wanna go ?',
    }, {
      dialogTitle: `Share ${selectedEvent.name}`,
    });
  }

  render() {
    const {
      selectedEvent, coverPosition, detailsStyle, onScroll,
    } = this.props;
    const eventLocation = this.getEventLocation();
    return (
      <Fragment>
        {selectedEvent && <AnimatableImage
          transition={['top', 'left', 'width', 'height']}
          style={{ position: 'absolute', zIndex: 2, ...coverPosition }}
          source={{ uri: getOr(null, 'cover.source')(selectedEvent) }}
        />}
        {selectedEvent && <Animatable.View
          transition={['opacity', 'top']} duration={0}
          style={{
            position: 'absolute', backgroundColor: null, display: 'flex', height: 2000, zIndex: 2, ...detailsStyle,
          }}
        >
          <ScrollView onScroll={onScroll}>
            <View style={{ height: 200 }} />
            <View style={{ backgroundColor: 'white', minHeight: height }}>
              <TouchableWithoutFeedback onPress={this.handleCoverPress}>
                <View><Text style={styles.title}>{selectedEvent.name}</Text></View>
              </TouchableWithoutFeedback>
              <View style={styles.actionsContainer}>
                <View style={styles.informationContainer}>
                  <View style={styles.inlineInformation}>
                    <Icon name="people" style={styles.inlineInformationIcon} />
                    <Text>{selectedEvent.interested_count} people are interested</Text>
                  </View>
                  <View style={styles.inlineInformation}>
                    <Icon name="clock" style={styles.inlineInformationIcon} />
                    <Text>{moment(selectedEvent.start_time).format('llll')}</Text>
                  </View>
                  <View style={styles.inlineInformation}>
                    <Icon name="locate" style={styles.inlineInformationIcon} />
                    <Text>{selectedEvent.place.name}</Text>
                  </View>
                </View>
                <Button style={styles.actionButton} transparent onPress={this.handleShare}>
                  <Icon name="share" style={{ color: '#6136e8' }} />
                </Button>
              </View>
              <MapView
                onPress={this.handleMapPress}
                style={styles.map}
                showsUserLocation
                zoomEnabled={false}
                zoomControlEnabled={false}
                scrollEnabled={false}
                ref={(ref) => { this.mapRef = ref; }}
                onLayout={() =>
                  this.mapRef.fitToCoordinates([this.getMyLocation(), this.getEventLocation()], //eslint-disable-line
                  { edgePadding: { top: 70, right: 20, bottom: 20, left: 20 }, animated: false }) //eslint-disable-line
                }
              >
                <MapView.Marker coordinate={eventLocation} />
              </MapView>
              <Text style={styles.description}>{selectedEvent.description}</Text>
            </View>
          </ScrollView>
        </Animatable.View>}
      </Fragment>
    );
  }
}
