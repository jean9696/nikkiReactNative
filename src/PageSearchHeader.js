import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';
import { Header, Item, Input, Icon, Button, Text } from 'native-base';


export default class PageSearchHeader extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      search: '',
    };
  }

  handleSearchChange = search => this.setState({ search });

  handleSearch = () => this.props.onSearch(this.state.search);

  render() {
    return (
      <Header iosBarStyle="light-content" androidStatusBarColor="#4b28b7" searchBar rounded style={{ backgroundColor: '#6136e8' }}>
        <Item style={{ backgroundColor: 'white' }}>
          {Platform.OS === 'android' && <Button onPressIn={this.props.onBack} transparent style={{ paddingBottom: 10 }}>
            <Icon name="arrow-back" style={{ color: '#6c6d74' }} />
          </Button>}
          {Platform.OS === 'ios' && <Icon name="ios-search" />}
          <Input
            onEndEditing={this.handleSearch}
            onChangeText={this.handleSearchChange} value={this.state.search}
            placeholder="Search"
          />
          {Platform.OS === 'android' && <Button transparent style={{ paddingBottom: 10 }} onPress={this.handleSearch}>
            <Icon name="search" style={{ color: '#6c6d74' }} />
          </Button>}
        </Item>
        <Button transparent onPress={this.handleSearch}>
          <Text style={{ color: '#ffffff' }}>Search</Text>
        </Button>
      </Header>
    );
  }
}
