import React from 'react'
import { Component } from 'react';
import VerticalScrollView from './VerticalScrollView';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { useNavigation } from '@react-navigation/native';

var apiRootUrl = Platform.OS === 'ios' ? 'http://localhost:9000/' : 'http://10.0.2.2:9000/';
// var apiRootUrl = 'http://10.0.2.2:9000/'; //ANDROID

interface Props {}
interface State {
  images: any[]
}

class HomeScreen extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      images: []
    }
  }

  componentDidMount() {
    console.log("HomeScreen mounted.");
    this.fetchImages().then(() => {
      console.log("State after fetching images from server: ");
      console.log(this.state);
    }).catch(err => {
      console.log("Err trying to fetch images: ");
      console.log(err);
    });
  }

  fetchImages() {
    return new Promise((resolve, reject) => {
      fetch(apiRootUrl + 'images/all/location').then(res => {
        res.json().then(data => {
          // var imageUrls: string[] = [];
          // var imageUrlRoot = apiRootUrl + 'images/';

          // imageNames.forEach(imageName => {
          //   imageUrls.push(imageUrlRoot + imageName);
          // });

          // this.setState({
          //   imageUrls: imageUrls
          // });
          console.log("data inside fetchImages: ", data);
          
          var imageUrlRoot = apiRootUrl + 'images/';
          var images = [];
          
          data.forEach(img => {
            images.push({ _id: img._id, url: imageUrlRoot + img.path});
          });

          this.setState({images: images});
          resolve();
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  render() {
    return (
      <View style={styles.sectionContainer} >
        {/* <Text>Test</Text>
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: this.state.imageUrls[0] }}
        />
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: this.state.uploadImage.uri === "" ? 'https://upload.wikimedia.org/wikipedia/commons/6/64/Poster_not_available.jpg' : this.state.uploadImage.uri }}
        /> */}
        <VerticalScrollView images={this.state.images} apiRootUrl={apiRootUrl}/>
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

export default HomeScreen;