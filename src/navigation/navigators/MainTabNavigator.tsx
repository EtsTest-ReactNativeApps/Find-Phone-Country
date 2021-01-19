import React from 'react';
// @ts-ignore
import {Icon} from 'native-base/src';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';

import HomeTab from '../../screens/tabs/HomeTab';
import HistoryTab from '../../screens/tabs/HistoryTab';

const MainTabNavigator = createMaterialTopTabNavigator(
    {
        Home: {
            screen: HomeTab,
            navigationOptions: {
                tabBarLabel: 'Home',
                tabBarIcon: ({tintColor}) => (
                    <Icon name="ios-home" style={{color: tintColor, width: '140%'}}/>
                )
            }
        },
        History: {
            screen: HistoryTab,
            navigationOptions: {
                tabBarLabel: 'History',
                tabBarIcon: ({tintColor}) => (
                    <Icon name="ios-time" style={{color: tintColor, width: '140%'}}/>
                )
            }
        }
    },
    {
        lazy: true,
        swipeEnabled: true,
        tabBarPosition: 'bottom',
        tabBarOptions: {
            showIcon: true,
            showLabel: true,
            upperCaseLabel: false,
            allowFontScaling: true,
            indicatorStyle: {
                opacity: 0
            },
            style: {
                backgroundColor: '#B71C1C',
                height: '11.5%',
                borderTopWidth: 0
            },
            activeTintColor: '#ffffff',
            inactiveTintColor: '#bababa'
        },
        navigationOptions: () => ({
            headerShown: true
        })
    }
);

export default MainTabNavigator;