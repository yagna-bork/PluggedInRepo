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
  Image,
  TouchableOpacity
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob'

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
  imageUrls: string[],
  avatarSource: { uri: string }
}

var emptyAvatarSource = { uri: "" };
var apiRootUrl = 'http://localhost:9000/';
    // var apiRootUrl = 'http://10.0.2.2:9000/';

class App extends Component<Props, State> {
  constructor(props : Props) {
    super(props);

    this.state = {
      imageUrls: [],
      avatarSource: emptyAvatarSource
    }
  }

  componentDidMount() {
    fetch(apiRootUrl + 'images/all/location').then(res => {
      console.log("before json()");
      res.json().then(imageNames => {
        var imageUrls: string[] = [];
        var imageUrlRoot = apiRootUrl + 'images/';

        imageNames.forEach(imageName => {
          imageUrls.push(imageUrlRoot + imageName);
        });

        this.setState({
          imageUrls: imageUrls,
          avatarSource: emptyAvatarSource
        });

        console.log(this.state);
      });
    }).catch((err) => {
      console.log("caught error");
      console.log(err);
    });
  }

  selectImage() {
    const options = {
      title: 'Select Avatar',
      customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.uri };

        this.setState({
          imageUrls: this.state.imageUrls,
          avatarSource: source
        });
      }
    });
  }

  uploadImage() {
    RNFetchBlob.fetch('POST', '', {
      Authorization: "Bearer access-token",
      otherHeader: "foo",
      'Content-Type': 'multipart/form-data',
    }, [
      { name: 'avatar-foo', filename: 'avatar-foo.png', type: 'image/foo', data: RNFetchBlob.wrap(this.state.avatarSource.uri) }
    ]).then((resp) => {
      console.log("resp after uploading file: " + resp);
    }).catch((err) => {
      console.log("err after uploading file: " + err);
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
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: this.state.avatarSource.uri === "" ? 'https://upload.wikimedia.org/wikipedia/commons/6/64/Poster_not_available.jpg' : this.state.avatarSource.uri }}
        />
        <TouchableOpacity style={{ width: 200, height: 200 }} onPress={this.selectImage.bind(this)}>
          <Text>Select</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 200, height: 200 }} onPress={this.uploadImage.bind(this)}>
          <Text>Upload</Text>
        </TouchableOpacity>
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
