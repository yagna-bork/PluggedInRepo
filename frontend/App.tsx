/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react'
import { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Hello from './components/Hello';

interface Props {}
interface State {
  imageUrls: string[]
}

class App extends Component<Props, State> {
  constructor(props : Props) {
    super(props);

    this.state = {
      imageUrls: []
    }
  }

  componentDidMount() {
    var apiRootUrl = 'http://localhost:9000/';
    // var apiRootUrl = 'http://10.0.2.2:9000/';
    fetch(apiRootUrl + 'images/all/location').then(res => {
      console.log("before json()");
      res.json().then(imageNames => {
        var imageUrls: string[] = [];
        var imageUrlRoot = apiRootUrl + 'images/';

        imageNames.forEach(imageName => {
          imageUrls.push(imageUrlRoot + imageName);
        });

        this.setState({
          imageUrls: imageUrls
        });

        console.log(this.state);
      });
    }).catch((err) => {
      console.log("caught error");
      console.log(err);
    });
  }

  render() {
    return (
      <View style={styles.sectionContainer} >
        <Text>Test</Text>
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: this.state.imageUrls[1] }}
        />
      </View>

    );
  }
} 

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
