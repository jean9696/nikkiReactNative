import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Dimensions, BackHandler, Linking, TouchableOpacity, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import getOr from 'lodash/fp/getOr';
import GeoFire from 'geofire';
import firebase from 'react-native-firebase';
import { Content, Icon, Button, Text, List, ListItem, Body, Thumbnail, Right, Spinner } from 'native-base';
import Events from './Events';
import Lottie from './Lottie';
import PageSearchHeader from './PageSearchHeader';

const { height } = Dimensions.get('window');
const AnimatableFlatList = Animatable.createAnimatableComponent(FlatList);
const accessToken = '882770281812876|OKkHqrGgI_Y5dLslwTBpyzoxPhg';

export default class PageSearch extends Component {
  static propTypes = {
    changeRoute: PropTypes.func.isRequired,
    location: PropTypes.arrayOf(PropTypes.number).isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      data: [],
      loading: true,
      registeredPages: {},
    };
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.handleBack();
      return true;
    });
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
      radius: 2000,
    });
    this.geoQuery = geoQuery.on('key_entered', (key) => {
      firebase.database().ref(`/pages/${key}`).once('value').then((snapshot) => {
        const page = snapshot.val();
        const registeredPages = {
          ...this.state.registeredPages,
          [key]: page,
        };
        this.setState({ registeredPages });
        this.setState({ data: Object.values(registeredPages) });
      });
    });
  }

  isActive = page => page.active || getOr(false, `[${page.id}]`)(this.state.registeredPages)

  handleSearch = async (search) => {
    this.geoQuery.cancel();
    this.setState({ loading: true });
    const response = await fetch(`https://graph.facebook.com/search?q=${search}&type=page&fields=picture,name,location,description&access_token=${accessToken}`);
    const data = getOr([], 'data')(JSON.parse(response._bodyInit)); //eslint-disable-line
    this.setState({
      data: search.length > 0 ? data : Object.values(this.state.registeredPages),
      loading: false,
    });
  }

  handleBack = () => this.props.changeRoute(Events);

  handlePagePress = (pageId) => {
    Linking.openURL(`https://www.facebook.com/${pageId}/`);
  }

  handleAddPage = (page, e) => {
    e.stopPropagation();
    this.setState({
      registeredPages: {
        ...this.state.registeredPages,
        [page.id]: page,
      },
    });
    firebase.database().ref(`/pages/${page.id}`).update({
      ...page,
      active: true,
    });
  }

  render() {
    return (
      <Content>
        <PageSearchHeader onSearch={this.handleSearch} onBack={this.handleBack} />
        <View style={{ flex: 1, height: Platform.OS === 'ios' ? height - 65 : height - 80 }}>
          {this.state.loading ?
            <View style={{ height: 150, marginTop: 100 }}><Spinner /></View> :
            <List>
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
                data={this.state.data}
              />
            </List>}
        </View>
      </Content>
    );
  }
}
