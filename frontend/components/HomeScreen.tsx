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
  TouchableOpacity
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { useNavigation } from '@react-navigation/native';

var apiRootUrl = 'http://localhost:9000/'; //IOS
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
    this.fetchReplies("5e713d633f8d8400b0077d4c").then(() => {
      // console.log("State after fetching replies from server: ");
      // console.log(this.state);
      console.log("Done fetching replies from server.");
    }).catch(err => {
      console.log("Err trying to fetch replies: ");
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
            images.push({ _id: img.id, url: imageUrlRoot + img.path});
          });

          this.setState({images: images});
          resolve();
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  fetchReplies(parentId: string) {
    return new Promise((resolve, reject) => {
      fetch(apiRootUrl + `images/reply?parentId=${encodeURIComponent(parentId)}`).then(res => {
        res.json().then(replyNames => {
          var replyUrls: string[] = [];
          var imageUrlRoot = apiRootUrl + 'images/';

          replyNames.forEach(replyName => {
            replyUrls.push(imageUrlRoot + replyName);
          });


          //do something with them
          console.log("fetchReplies: ", replyUrls); 
          resolve();
        }).catch(err => {
          reject(err);
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
        <VerticalScrollView images={this.state.images}/>
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