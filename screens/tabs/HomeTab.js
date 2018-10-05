import { Container, Text, Icon, Button } from 'native-base';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
  Keyboard,
  TextInput,
  Alert
} from 'react-native';

import fetchNumberInfo from '../../api/fetchNumberInfo';
import capitalizeFirstLetter from '../../utils/stringUtils';

export default class HomeTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyboardActive: false,
      phone: '',
      carrier: '',
      countryOfOrigin: '',
      phoneType: ''
    };
  }

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => {
      return <Icon name="ios-home-outline" style={{ color: tintColor }} />;
    }
  };

  state = {
    keyboardActive: false
  };

  _keyboardDidShow = () => {
    this.setState({ keyboardActive: true });
  };

  _keyboardDidHide = () => {
    this.setState({ keyboardActive: false });
  };

  didFocusSubscription = this.props.navigation.addListener('didFocus', () => {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide
    );
    this.setState({ keyboardActive: false });
  });

  willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.setState({ keyboardActive: false });
  });

  componentWillUnmount = () => {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.setState({ keyboardActive: false });
  };

  onChangeFormNumber = text => {
    this.setState({
      phone: text.replace(/[^0-9]/g, '')
    });
  };

  onClearFormNumber = () => {
    this.setState({
      phone: '',
      carrier: '',
      countryOfOrigin: '',
      phoneType: ''
    });
  };

  onSubmitFormNumber = () => {
    if (this.state.phone.length > 5) {
      fetchNumberInfo(this.state.phone).then(apiResponse => {
        if (apiResponse === 'error') {
          Alert.alert('Error', 'Please Check your internet connection!');
        } else {
          console.log(apiResponse);
          if (apiResponse.valid) {
            this.setState({
              carrier: apiResponse.carrier
                ? capitalizeFirstLetter(apiResponse.carrier)
                : 'Not Available',
              countryOfOrigin: apiResponse.location
                ? capitalizeFirstLetter(apiResponse.location) +
                  ', ' +
                  capitalizeFirstLetter(apiResponse.country_name)
                : capitalizeFirstLetter(apiResponse.country_name),
              phoneType: capitalizeFirstLetter(apiResponse.line_type)
            });
          } else {
            Alert.alert(
              'Error',
              'Please enter a valid phone number with the appropriate country code!'
            );
          }
        }
      });
    } else {
      Alert.alert(
        'Error',
        'Please enter a valid phone number with the appropriate country code!'
      );
    }
  };

  render() {
    const buttonGroup = this.state.keyboardActive ? null : (
      <View style={styles.buttonGroup}>
        <Button iconLeft light>
          <Icon name="ios-contacts" />
          <Text>LOAD</Text>
        </Button>
        <Button
          iconLeft
          light
          onPress={() => {
            this.onSubmitFormNumber();
          }}>
          <Icon name="ios-search" />
          <Text>FIND</Text>
        </Button>
        <Button
          iconLeft
          light
          onPress={() => {
            this.onClearFormNumber();
          }}>
          <Icon name="ios-trash" />
          <Text>CLEAR</Text>
        </Button>
      </View>
    );

    return (
      <Container style={styles.containerStyle}>
        <StatusBar backgroundColor="#B71C1C" />

        <Image
          source={require('../../assets/globenphone.png')}
          style={
            this.state.keyboardActive
              ? styles.imageStyleKeyboardUp
              : styles.imageStyle
          }
        />

        <View
          style={
            this.state.keyboardActive
              ? styles.formStyleKeyboardUp
              : styles.formStyle
          }>
          <TextInput
            style={styles.inputFormNumberStyle}
            keyboardType="numeric"
            onChangeText={enteredNumber =>
              this.onChangeFormNumber(enteredNumber)
            }
            placeholder="Enter Phone Number"
            autoCapitalize={'none'}
            placeholderTextColor="#dedede"
            onSubmitEditing={() => this.onSubmitFormNumber()}
            selectionColor="red"
            returnKeyType="search"
            returnKeyLabel="Find"
            underlineColorAndroid="white"
            value={this.state.phone}
            maxLength={16}
          />
        </View>

        <View style={styles.infoGroup}>
          <Text
            style={
              this.state.keyboardActive
                ? styles.infoTextKeyboardUp
                : styles.infoText
            }>
            Country Of Origin:
            {this.state.countryOfOrigin ? ' ' + this.state.countryOfOrigin : ''}
          </Text>
          <Text
            style={
              this.state.keyboardActive
                ? styles.infoTextKeyboardUp
                : styles.infoText
            }>
            Phone Type:
            {this.state.phoneType ? ' ' + this.state.phoneType : ''}
          </Text>
          <Text
            style={
              this.state.keyboardActive
                ? styles.infoTextKeyboardUp
                : styles.infoText
            }>
            Mobile Carrier:
            {this.state.carrier ? ' ' + this.state.carrier : ''}
          </Text>
        </View>

        {buttonGroup}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: '#212121',
    flex: 10,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  imageStyle: {
    flex: 4,
    alignSelf: 'center',
    resizeMode: 'center'
  },
  imageStyleKeyboardUp: {
    flex: 1,
    paddingTop: 2,
    alignSelf: 'center',
    resizeMode: 'center'
  },
  formStyle: {
    flex: 1,
    alignSelf: 'center',
    minWidth: '80%',
    paddingBottom: 8,
    marginLeft: 40,
    marginRight: 50
  },
  inputFormNumberStyle: {
    textAlign: 'center',
    color: 'white'
  },
  formStyleKeyboardUp: {
    flex: 1,
    alignSelf: 'center',
    minWidth: '80%',
    paddingBottom: 4,
    marginLeft: 40,
    marginRight: 50
  },
  infoText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 12
  },
  infoTextKeyboardUp: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 4
  },
  infoGroup: {
    flex: 1.4,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  buttonGroup: {
    paddingTop: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  }
});
