import React, { Component } from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { Container, Text, Button, Spinner } from 'native-base';
import { Font, Constants, AppLoading, Location, Permissions } from 'expo';
import Lottie from './src/Lottie';
import Router from './src/Router';


export default class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      location: null,
      locationLoading: false,
      ready: false,
    };
  }

  componentWillMount() {
    StatusBar.setBarStyle('light-content', true);
  }

  getLocationAsync = () => {
    this.setState({ locationLoading: true });
    return Permissions.askAsync(Permissions.LOCATION).then(() => Location.getCurrentPositionAsync({}).then((location) => {
      this.setState({
        location: [location.coords.latitude, location.coords.longitude],
        locationLoading: false,
      });
    })).catch(() => setTimeout(() => this.setState({ locationLoading: false }), 1000));
  };


  loadAsync = async () => {
    const locationPromise = this.getLocationAsync();
    const authPromise = firebase.auth().signInAnonymously().catch((e) => {
      console.log(e)//eslint-disable-line
    });
    const fontPromise = Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'), //eslint-disable-line
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'), //eslint-disable-line
    });
    return Promise.all([locationPromise, authPromise, fontPromise]);
  }

  render() {
    return this.state.ready ? (
      <View style={{ paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight, flex: 1 }}>
        {this.state.location ?
          <Router location={this.state.location} /> :
          <View style={{ flex: 1, paddingTop: 100, backgroundColor: 'white' }}>
            <Text style={{ marginBottom: 30, color: '#6136e8', textAlign: 'center' }}>
              Please allow us to access your position
            </Text>
            <Lottie name="location" style={{ height: 100 }} />
            <View style={{
 flex: 1, flexDirection: 'row', justifyContent: 'center', height: 50,
}}
            >
              {this.state.locationLoading ? <Spinner /> :
              <Button style={{ marginTop: 30, backgroundColor: '#6136e8' }} onPress={this.getLocationAsync}>
                <Text>Try again, tamer</Text>
              </Button>}
            </View>
          </View>
        }
      </View>
    ) : (
      <AppLoading
        startAsync={this.loadAsync}
        onFinish={() => this.setState({ ready: true })}
        onError={console.warn}
      />
    );
  }
}
