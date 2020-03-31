import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import Geolocation from '@react-native-community/geolocation';
import {RNCamera} from 'react-native-camera';

var apiRootUrl =
  Platform.OS === 'ios' ? 'http://localhost:9000/' : 'http://10.0.2.2:9000/';

interface Props {
  navigation: any;
}
interface State {
  uploadImage: {uri: string; data: string};
  location: {lat: number; long: number};
}

var emptyAvatarSource = {
  uri: '',
  data: '',
  location: {ready: false, lat: null, long: null},
};
var defaultLocation = {ready: false, lat: -100000, long: -100000};

class UploadScreen extends Component<Props, State> {
  camera: any;
  constructor(props: Props) {
    super(props);

    this.state = {
      uploadImage: emptyAvatarSource,
      location: defaultLocation,
    };

    this.selectImage = this.selectImage.bind(this);
    this.takePicture = this.takePicture.bind(this);
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      this.getCurrentLocation()
        .then(() => {
          console.log('State after getting location of phone: ');
          console.log(this.state);
        })
        .catch(err => {
          console.log('Err trying to get location from phone: ');
          console.log(err);
        });
    } else {
      //ANDROID permissions
      this.requestLocationPermission()
        .then(() => {
          this.getCurrentLocation();
        })
        .then(() => {
          this.requestCameraPermission();
        })
        .then(() => {
          console.log('State after getting location of phone: ');
          console.log(this.state);
        })
        .catch(err => {
          console.log('Err trying to get location from phone: ');
          console.log(err);
        });
    }
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      let geoOptions = {
        enableHighAccuracy: true,
        timeOut: 20000,
        maximumAge: 60 * 60 * 24, //info valid for one day?
      };

      Geolocation.getCurrentPosition(
        position => {
          this.setState(prevState => {
            return {
              uploadImage: prevState.uploadImage,
              location: {
                lat: position.coords.latitude,
                long: position.coords.longitude,
              },
            };
          });
          resolve();
        },
        err => {
          reject(err);
        },
        geoOptions,
      );
    });
  }

  selectImage() {
    const options = {
      title: 'Select Avatar',
      customButtons: [{name: 'fb', title: 'Choose Photo from Facebook'}],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = {uri: response.uri, data: response.data};

        this.setState(prevState => {
          return {
            uploadImage: source,
            location: prevState.location,
          };
        });

        console.log('State after getting image from gallery: ');
        console.log(this.state);

        console.log('About to upload image selected from gallery.');
        this.uploadImage();
      }
    });
  }

  uploadImage() {
    this.getCurrentLocation().then(() => {
      console.log('Trying to upload image to server. Current state is: ');
      console.log(this.state);
      RNFetchBlob.fetch(
        'POST',
        apiRootUrl + 'images',
        {
          Authorization: 'Bearer access-token',
          otherHeader: 'foo',
          'Content-Type': 'multipart/form-data',
        },
        [
          {
            name: 'image',
            filename: 'image.png',
            type: 'image/png',
            data: this.state.uploadImage.data,
          },
          {
            name: 'metadata',
            data: JSON.stringify({
              lat: this.state.location.lat,
              long: this.state.location.long,
            }),
          },
        ],
      )
        .then(resp => {
          console.log('Response from server after uploading image: ');
          console.log(resp);
        })
        .catch(err => {
          console.log('Err trying to upload iamge to server: ');
          console.log(err);
        });
    });
  }

  uploadReply(parentId: any) {
    this.getCurrentLocation().then(() => {
      console.log('Trying to upload image to server. Current state is: ');
      console.log(this.state);
      RNFetchBlob.fetch(
        'POST',
        apiRootUrl + 'images/replies',
        {
          Authorization: 'Bearer access-token',
          otherHeader: 'foo',
          'Content-Type': 'multipart/form-data',
        },
        [
          {
            name: 'image',
            filename: 'image.png',
            type: 'image/png',
            data: this.state.uploadImage.data,
          },
          {
            name: 'metadata',
            data: JSON.stringify({
              lat: this.state.location.lat,
              long: this.state.location.long,
              parentId,
            }),
          },
        ],
      )
        .then(resp => {
          console.log('Response from server after uploading image: ');
          console.log(resp);
        })
        .catch(err => {
          console.log('Err trying to upload iamge to server: ');
          console.log(err);
        });
    });
  }

  //android permissions
  async requestLocationPermission() {
    console.log('Trying to get location permissions.');
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
      console.log('Err while trying to get location permission: ');
      console.log(err);
    }
  }

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async takePicture() {
    if (this.camera) {
      const options = {quality: 0.5, base64: true};
      this.camera
        .takePictureAsync(options)
        .then((img: {uri: any; base64: any}) => {
          const source = {uri: img.uri, data: img.base64};

          this.setState(prevState => {
            return {
              uploadImage: source,
              location: prevState.location,
            };
          });

          console.log(
            'Picture taken successfully. State after taking picture: ',
          );
          console.log(this.state);
        })
        .then(() => {
          this.uploadImage();
        })
        .catch((err: any) => {
          console.warn('Err trying to take picture. Camera handler exists.');
          console.warn(err);
        });
    } else {
      console.warn('Err trying to take picture.');
    }
  }

  renderCamera = () => {
    console.log('Rendering camera');
    const isActive = this.props.navigation.isFocused();
    if (isActive) {
      return (
        <RNCamera
          ref={(ref: any) => {
            this.camera = ref;
          }}
          style={styles.preview}>
          <View style={styles.view}>
            <TouchableOpacity style={styles.capture} onPress={this.selectImage}>
              <Text>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
              <Text style={styles.text}> SNAP </Text>
            </TouchableOpacity>
          </View>
        </RNCamera>
      );
    } else {
      return null;
    }
  };

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
}

// {/* <Text>Upload One</Text>
//         <Image
//           style={{ width: 100, height: 100 }}
//           source={{ uri: this.state.uploadImage.uri === "" ? 'https://upload.wikimedia.org/wikipedia/commons/6/64/Poster_not_available.jpg' : this.state.uploadImage.uri }}
//         />
//         <TouchableOpacity style={{ width: 200, height: 50 }} onPress={this.selectImage.bind(this)}>
//           <Text>Select</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={{ width: 200, height: 50 }} onPress={this.uploadImage.bind(this)}>
//           <Text>Upload</Text>
//         </TouchableOpacity> */}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
  },
  view: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

// export default withNavigationFocus(UploadScreen);
export default UploadScreen;
