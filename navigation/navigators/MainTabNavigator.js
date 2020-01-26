import React from 'react';
import { Icon } from 'native-base';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import HomeTab from '../../screens/tabs/HomeTab';
import HistoryTab from '../../screens/tabs/HistoryTab';

const MainTabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: HomeTab,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-home" style={{ color: tintColor }} />
        )
      }
    },
    History: {
      screen: HistoryTab,
      navigationOptions: {
        tabBarLabel: 'History',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-time" style={{ color: tintColor }} />
        )
      }
    }
  },
  {
    animationEnabled: true,
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
        backgroundColor: '#C62828'
      },
      activeTintColor: '#ffffff',
      inactiveTintColor: '#d6d6d6'
    },
    navigationOptions: ({ navigation }) => ({
      headerShown: true
    })
  }
);

export default MainTabNavigator;
