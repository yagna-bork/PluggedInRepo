import React from 'react'
import { Component } from 'react';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
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

interface Props {}
interface State {
  imageUrls: string[],
  uploadImage: { uri: string, data: string },
  location: { ready: boolean, lat: number, long: number }
}

var emptyAvatarSource = { uri: "", data: "", location: { ready: false, lat: null, long: null } };
var defaultLocation = { ready: false, lat: -100000, long: -100000 };

var apiRootUrl = 'http://localhost:9000/'; //IOS
// var apiRootUrl = 'http://10.0.2.2:9000/'; //ANDROID

class UploadScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      imageUrls: [],
      uploadImage: emptyAvatarSource,
      location: defaultLocation
    }
  }
  
  componentDidMount() {
    this.fetchImages().then(() => {
      console.log("State after fetching images from server: ");
      console.log(this.state);
    }).catch(err => {
      console.log("Err trying to fetch images: ");
      console.log(err);
    });

    //IOS
    this.getCurrentLocation().then(() => {
      console.log("state after location: ");
      console.log(this.state);
    }).catch(err => {
      console.log("err location: ");
      console.log(err);
      console.log("api version: " + Platform.Version);
    });

    //ANDROID permissions
    // this.requestLocationPermission().then(() => {
    //   this.getCurrentLocation();
    // }).then(() => {
    //   this.requestCameraPermission();
    // }).then(() => {
    //   console.log("State after getting location of phone: ");
    //   console.log(this.state);
    // }).catch(err => {
    //   console.log("Err trying to get location from phone: ");
    //   console.log(err);
    // });
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      let geoOptions = {
        enableHighAccuracy: true,
        timeOut: 20000,
        maximumAge: 60 * 60 * 24 //info valid for one day?
      }

      Geolocation.getCurrentPosition(position => {
        this.setState({
          imageUrls: this.state.imageUrls,
          uploadImage: this.state.uploadImage,
          location: { ready: true, lat: position.coords.latitude, long: position.coords.longitude }
        });
        resolve();
      }, err => {
        reject(err);
      }, geoOptions);
    });
  }

  fetchImages() {
    return new Promise((resolve, reject) => {
      fetch(apiRootUrl + 'images/all/location').then(res => {
        res.json().then(imageNames => {
          var imageUrls: string[] = [];
          var imageUrlRoot = apiRootUrl + 'images/';

          imageNames.forEach(imageName => {
            imageUrls.push(imageUrlRoot + imageName);
          });

          this.setState({
            imageUrls: imageUrls,
            uploadImage: emptyAvatarSource
          });
          resolve();
        });
      }).catch((err) => {
        reject(err);
      });
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
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        console.log('image object: ');
        console.log(response);
        const source = { uri: response.uri, data: response.data };

        this.setState({
          imageUrls: this.state.imageUrls,
          uploadImage: source
        });
      }
    });
  }

  uploadImage() {
    this.getCurrentLocation().then(() => {
      console.log("Trying to upload image to server. Current state is: ");
      console.log(this.state);
      RNFetchBlob.fetch('POST', apiRootUrl + 'images', {
        Authorization: "Bearer access-token",
        otherHeader: "foo",
        'Content-Type': 'multipart/form-data',
      }, [
        { name: 'image', filename: 'image.png', type: 'image/png', data: this.state.uploadImage.data },
        {
          name: 'metadata', data: JSON.stringify({
            lat: this.state.location.lat,
            long: this.state.location.long
          })
        }
      ]).then((resp) => {
        console.log('Response from server after uploading image: ');
        console.log(resp);
      }).catch((err) => {
        console.log('Err trying to upload iamge to server: ');
        console.log(err);
      });
    });
  }

  uploadImage() {
    this.getCurrentLocation().then(() => {
      console.log("Trying to upload image to server. Current state is: ");
      console.log(this.state);
      RNFetchBlob.fetch('POST', apiRootUrl + 'images', {
        Authorization: "Bearer access-token",
        otherHeader: "foo",
        'Content-Type': 'multipart/form-data',
      }, [
        { name: 'image', filename: 'image.png', type: 'image/png', data: this.state.uploadImage.data },
        {
          name: 'metadata', data: JSON.stringify({
            lat: this.state.location.lat,
            long: this.state.location.long
          })
        }
      ]).then((resp) => {
        console.log('Response from server after uploading image: ');
        console.log(resp);
      }).catch((err) => {
        console.log('Err trying to upload iamge to server: ');
        console.log(err);
      });
    });
  }

  //android permissions
  async requestLocationPermission() {
    console.log("Trying to get location permissions.");
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location access',
          message:
            'PluggedIn needs access to your location ' +
            "so you can see what's going on around yoy.",
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.log("Err while trying to get location permission: ");
      console.log(err);
    }
  }

  render() {
    return (
      <View style={styles.sectionContainer}>
        <Text>Upload</Text>
        <TouchableOpacity style={{ width: 200, height: 50 }} onPress={this.selectImage.bind(this)}>
          <Text>Select</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 200, height: 50 }} onPress={this.uploadImage.bind(this)}>
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

export default UploadScreen;