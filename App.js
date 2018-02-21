import React, { Component } from 'react';
import * as firebase from 'firebase';
import { View, Platform, StatusBar } from 'react-native';
import { Container, Text, Button, Spinner } from 'native-base';
import { Font, Constants, AppLoading, Location, Permissions } from 'expo';
import Lottie from './src/Lottie';
import Router from './src/Router';

StatusBar.setBarStyle('light-content', true);

firebase.initializeApp({
  apiKey: 'AIzaSyCvRLFX4OdB0s0Hx5Tyh9RbfMiSDDqskrc',
  authDomain: 'nikki-8d0a5.firebaseapp.com',
  databaseURL: 'https://nikki-8d0a5.firebaseio.com',
  projectId: 'nikki-8d0a5',
  storageBucket: 'nikki-8d0a5.appspot.com',
  messagingSenderId: '916258383936',
});


export default class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      location: null,
      locationLoading: false,
      ready: false,
    };
  }

  getLocationAsync = () => {
    this.setState({ locationLoading: true });
    return Permissions.askAsync(Permissions.LOCATION).then(
      () => Location.getCurrentPositionAsync({}).then((location) => {
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
      <Container style={{ paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight  }}>
        {this.state.location ?
          <Router location={this.state.location} /> :
          <View style={{ flex: 1, paddingTop: 100 }}>
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
                <Text>Try again</Text>
              </Button>}
            </View>
          </View>
        }
      </Container>
    ) : (
      <AppLoading
        startAsync={this.loadAsync}
        onFinish={() => this.setState({ ready: true })}
        onError={console.warn}
      />
    );
  }
}
