/* eslint-disable react-native/no-unused-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './components/HomeScreen';
import UploadScreen from './components/UploadScreen';

const Tab = createBottomTabNavigator();

interface Props {}
interface State {}

//refreshing homepage when you click on it
function HomeScreenTab() {
  return <HomeScreen />;
}

//store sharing state between children components
class Store {
  state: {};
  constructor() {
    this.state = {};
  }

  mergeState(partialState: any) {
    Object.assign(this.state, partialState);
  }
}

const myStore = new Store();

class App extends Component<Props, State> {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreenTab} />
          <Tab.Screen name="Upload" component={UploadScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
