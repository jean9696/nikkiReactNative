import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Permissions, Notifications } from 'expo';
import { FlatList, View, Linking, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import getOr from 'lodash/fp/getOr';
import GeoFire from 'geofire';
import * as firebase from 'firebase';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import { Icon, Button, Text, List, ListItem, Body, Thumbnail, Right, Spinner } from 'native-base';
import Lottie from '../components/Lottie';

const AnimatableFlatList = Animatable.createAnimatableComponent(FlatList);


export default class PageSearch extends Component {
  static propTypes = {
    location: PropTypes.arrayOf(PropTypes.number).isRequired,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      data: [],
      loading: true,
      registeredPages: {},
      showDialog: false,
      addedPageName: 'the page',
    };
  }

  componentWillMount() {
    this.geoFirePages = new GeoFire(firebase.database().ref('geoFirePages'));
    this.getPages();
    setTimeout(() => this.setState({ loading: false }), 1000);
  }

  componentWillUnmount() {
    this.geoQuery.cancel();
  }


  getPages = () => {
    const geoQuery = this.geoFirePages.query({
      center: this.props.location,
      radius: 20,
    });
    this.geoQuery = geoQuery.on('key_entered', (key) => {
      firebase.database().ref(`/pages/${key}`).once('value').then((snapshot) => {
        const page = snapshot.val();
        const registeredPages = {
          ...this.state.registeredPages,
          [key]: page,
        };
        this.setState({ registeredPages, data: Object.values(registeredPages) });
      });
    });
  }

  registerForPushNotificationsAsync = async (pageId) => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus === 'granted') {
      const token = await Notifications.getExpoPushTokenAsync();
      console.log(JSON.stringify(token))//eslint-disable-line
      firebase.database().ref(`/notifications/${pageId}}`).push(token);
    }
  }

  isActive = page => page.active || getOr(false, `[${page.id}]`)(this.state.registeredPages)

  handlePagePress = (pageId) => {
    Linking.openURL(`https://www.facebook.com/${pageId}/`);
  }

  handleAddPage = (page, e) => {
    e.stopPropagation();
    this.setState({
      addedPageName: page.name,
      showDialog: true,
      registeredPages: {
        ...this.state.registeredPages,
        [page.id]: page,
      },
    });
    firebase.database().ref(`/pages/${page.id}`).update({
      ...page,
      active: false,
    });
    this.registerForPushNotificationsAsync(page.id).catch();
  }

  render() {
    return this.props.loading || this.state.loading ?
      <View style={{ height: 150, marginTop: 100 }}><Spinner /></View> :
      [
        <PopupDialog
          key="dialog"
          width={0.8} show={this.state.showDialog}
          dialogTitle={<DialogTitle title="Thank you!" />}
        >
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
              {this.state.addedPageName} will be added shortly after a quick check by our team
            </Text>
            <Button full style={{ backgroundColor: '#6136e8' }} onPress={() => this.setState({ showDialog: false })}>
              <Text>close</Text>
            </Button>
          </View>
        </PopupDialog>,
        <List key="list">
          <AnimatableFlatList
            animation="fadeInUp"
            keyExtractor={e => e.id}
            ListEmptyComponent={() => (
              <View style={{
              flex: 1, justifyContent: 'center', alignContent: 'center', marginTop: 50,
            }}
              >
                <Lottie name="nothing" style={{ height: 200 }} />
                <Text style={{ textAlign: 'center', marginTop: 20 }}>
                No page found
                </Text>
              </View>
          )}
            renderItem={({ item }) => (
              <ListItem>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => this.handlePagePress(item.id)}
                >
                  <Thumbnail square size={80} source={{ uri: getOr(null, 'picture.data.url')(item) }} />
                </TouchableOpacity>
                <Body>
                  <Text>{getOr(null, 'name')(item)}</Text>
                  <Text note numberOfLines={1} ellipsizeMode="tail">{getOr(null, 'location.city')(item)}</Text>
                  <Text note numberOfLines={1} ellipsizeMode="tail">{getOr(null, 'description')(item)}</Text>
                </Body>
                <Right>
                  {this.isActive(item) && <Icon name="beer" style={{ color: '#6136e8', marginRight: 15 }} />}
                  {!this.isActive(item) &&
                  <Button transparent onPress={e => this.handleAddPage(item, e)}>
                    <Icon name="add" style={{ color: '#6c6d74' }} />
                  </Button>
                  }
                </Right>
              </ListItem>
          )}
            data={this.props.data.length > 0 ? this.props.data : this.state.data}
          />
        </List>,
      ];
  }
}
