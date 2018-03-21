import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Dimensions, BackHandler, Platform, AsyncStorage } from 'react-native';
import getOr from 'lodash/fp/getOr';
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import { Content, Button, Text } from 'native-base';
import Events from '../events/Events';
import PageList from './PageList';
import PageSearchHeader from './PageSearchHeader';

const { height } = Dimensions.get('window');
const accessToken = '882770281812876|OKkHqrGgI_Y5dLslwTBpyzoxPhg';

export default class PageSearch extends Component {
  static propTypes = {
    changeRoute: PropTypes.func.isRequired,
    location: PropTypes.arrayOf(PropTypes.number).isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      showDialog: false,
      loading: true,
      data: [],
    };
  }

  componentWillMount() {
    AsyncStorage.getItem('@nikki:pagesInfo').then((value) => {
      if (value !== 'true') {
        this.setState({ showDialog: true });
        AsyncStorage.setItem('@nikki:pagesInfo', 'true');
      }
    });

    BackHandler.addEventListener('hardwareBackPress', () => {
      this.handleBack();
      return true;
    });
    setTimeout(() => this.setState({ loading: false }), 1000);
  }

  handleSearch = async (search) => {
    this.setState({ loading: true });
    const response = await fetch(`https://graph.facebook.com/search?q=${search}&type=page&fields=picture,name,location,description&access_token=${accessToken}`);
    const data = getOr([], 'data')(JSON.parse(response._bodyInit)); //eslint-disable-line
    this.setState({
      data,
      loading: false,
    });
  }

  handleBack = () => this.props.changeRoute(Events);

  render() {
    console.log('tamer')//eslint-disable-line
    return (
      <Content>
        <PopupDialog
          width={0.8} show={this.state.showDialog}
          dialogTitle={<DialogTitle title="Help us improving Nikki!" />}
        >
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: 'center' }}>Add your favorite society for students!</Text>
            <Text style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
              Your student union, bar, game society...
              whatever is great for student life, Nikki takes it!
            </Text>
            <Button full style={{ backgroundColor: '#6136e8' }} onPress={() => this.setState({ showDialog: false })}>
              <Text>close</Text>
            </Button>
          </View>
        </PopupDialog>
        <PageSearchHeader onSearch={this.handleSearch} onBack={this.handleBack} />
        <View style={{ flex: 1, height: Platform.OS === 'ios' ? height - 65 : height - 80 }}>
          <PageList
            data={this.state.data} loading={this.state.loading}
            location={this.props.location}
          />
        </View>
      </Content>
    );
  }
}
