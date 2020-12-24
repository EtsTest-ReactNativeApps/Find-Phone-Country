import {Button, Icon, Text} from 'native-base';
import React, {PureComponent} from 'react';
import {Alert, Image, Keyboard, PermissionsAndroid, StatusBar, StyleSheet, TextInput, View} from 'react-native';
import {selectContactPhone} from 'react-native-select-contact';
import SplashScreen from 'react-native-splash-screen';

import fetchNumberInfo from '../../api/fetchNumberInfo';
import capitalizeFirstLetter from '../../utils/stringUtils';
import {saveRecord} from '../../db/asyncStorageProvider';

interface homeTabState {
    keyboardActive: boolean,
    phone?: string,
    carrier?: string,
    countryOfOrigin?: string,
    phoneType?: string
}

export default class HomeTab extends PureComponent {
    state: homeTabState = {
        keyboardActive: false
    };
    private keyboardDidShowListener: any;
    private keyboardDidHideListener: any;
    private willBlurSubscription: any;
    private willFocusSubscription: any;

    constructor(props: any) {
        super(props);
        this.state = {
            keyboardActive: false,
            phone: '',
            carrier: '',
            countryOfOrigin: '',
            phoneType: ''
        };
    }

    _keyboardDidShow = () => {
        this.setState({keyboardActive: true});
    };

    _keyboardDidHide = () => {
        this.setState({keyboardActive: false});
    };

    requestContactsPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                Alert.alert(
                    'Permission Denied',
                    'Please accept the "READ CONTACTS" permissions in order to use the "LOAD" function'
                );
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    componentWillUnmount = () => {
        this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.setState({keyboardActive: false});
    };

    componentDidMount = () => {
        // @ts-ignore
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            this.keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                this._keyboardDidShow
            );
            this.keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                this._keyboardDidHide
            );
            this.setState({keyboardActive: false});
        });

        // @ts-ignore
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
            this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
            this.setState({keyboardActive: false});
        });

        SplashScreen.hide();
    };

    onChangeFormNumber = (text: string) => {
        this.setState({
            phone: text.replace(/[^0-9+]/g, '')
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

    onLoadContacts = async () => {
        const hasPermissions = await this.requestContactsPermission();
        return hasPermissions
            ? selectContactPhone().then((selection) => {
                if (!selection) {
                    return null;
                }

                let {selectedPhone} = selection;
                let selectedPhoneNumber = selectedPhone.number;

                this.setState({
                    phone: selectedPhoneNumber.toString()
                });
                return selectedPhone.number;
            })
            : null;
    };

    onSubmitFormNumber = () => {
        if (this?.state?.phone && this.state.phone.length > 5) {
            fetchNumberInfo(this.state.phone).then((apiResponse) => {
                if (apiResponse === 'error') {
                    Alert.alert('Error', 'Please check your internet connection!');
                } else {
                    if (apiResponse.valid) {
                        this.setState(
                            {
                                carrier: apiResponse.carrier
                                    ? capitalizeFirstLetter(apiResponse.carrier)
                                    : 'Not Available',
                                countryOfOrigin: apiResponse.location
                                    ? capitalizeFirstLetter(apiResponse.location) +
                                    ', ' +
                                    capitalizeFirstLetter(apiResponse.country_name)
                                    : capitalizeFirstLetter(apiResponse.country_name),
                                phoneType: capitalizeFirstLetter(apiResponse.line_type)
                            },
                            () => {
                                saveRecord({
                                    phone: this.state.phone || '',
                                    carrier: this.state.carrier || '',
                                    countryOfOrigin: this.state.countryOfOrigin || '',
                                    phoneType: this.state.phoneType || ''
                                }).catch();
                            }
                        );
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

    renderInfoRow = (title: string, value: string) => {
        return (
            <View style={styles.infoRow}>
                <Text
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    style={
                        this.state.keyboardActive
                            ? styles.infoTextKeyboardUp
                            : styles.infoText
                    }>
                    {`${title}:`}
                </Text>
                <Text
                    numberOfLines={2}
                    ellipsizeMode='tail'
                    textBreakStrategy={'balanced'}
                    style={
                        this.state.keyboardActive
                            ? styles.infoValueKeyboardUp
                            : styles.infoValue
                    }>
                    {value ? value : ''}
                </Text>
            </View>
        );
    };

    renderInputField = () => {
        return (
            <View
                style={
                    this.state.keyboardActive
                        ? styles.formStyleKeyboardUp
                        : styles.formStyle
                }>
                <TextInput
                    style={styles.inputFormNumberStyle}
                    keyboardType="numeric"
                    onChangeText={(enteredNumber) =>
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
        );
    };

    renderButtonGroup = () => {
        return (
            this.state.keyboardActive ? null : (
                <View style={styles.buttonGroup}>
                    <Button
                        iconLeft
                        light
                        rounded
                        bordered
                        onPress={() => {
                            this.onLoadContacts().catch();
                        }}>
                        <Icon name="people-outline" style={styles.buttonText}/>
                        <Text style={styles.buttonText}>LOAD</Text>
                    </Button>
                    <Button
                        iconLeft
                        light
                        rounded
                        bordered
                        onPress={() => {
                            this.onSubmitFormNumber();
                        }}>
                        <Icon name="search" style={styles.buttonText}/>
                        <Text style={styles.buttonText}>FIND</Text>
                    </Button>
                    <Button
                        iconLeft
                        light
                        rounded
                        bordered
                        onPress={() => {
                            this.onClearFormNumber();
                        }}>
                        <Icon name="trash" style={styles.buttonText}/>
                        <Text style={styles.buttonText}>CLEAR</Text>
                    </Button>
                </View>
            ));
    };

    render() {
        return (
            <View style={styles.containerStyle}>
                <StatusBar backgroundColor="#B71C1C"/>

                <Image
                    source={require('../../../assets/globenphone.png')}
                    style={
                        this.state.keyboardActive
                            ? styles.imageStyleKeyboardUp
                            : styles.imageStyle
                    }
                />

                <View style={styles.inputAndTextContainer}>
                    {this.renderInputField()}
                    <View style={styles.infoGroup}>
                        {this.renderInfoRow('Country Of Origin', this.state.countryOfOrigin || '')}
                        {this.renderInfoRow('Phone Type', this.state.phoneType || '')}
                        {this.renderInfoRow('Mobile Carrier', this.state.carrier || '')}
                    </View>
                </View>
                {this.renderButtonGroup()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: '#212121',
        flex: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: 16
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
        textAlign: 'left',
    },
    infoTextKeyboardUp: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    infoValue: {
        color: 'white',
        fontWeight: 'normal',
        textAlign: 'right',
        flexShrink: 1,
        marginLeft: 26,
    },
    infoValueKeyboardUp: {
        color: 'white',
        fontWeight: 'normal',
        textAlign: 'right',
        flexShrink: 1,
        marginLeft: 8
    },
    infoGroup: {
        flex: 1.6,
        flexDirection: 'column',
        justifyContent: 'space-evenly'
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    buttonGroup: {
        paddingTop: 40,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    buttonText: {
        color: 'white'
    },
    inputAndTextContainer: {
        flex: 3,
        paddingHorizontal: 32,
    }
});
