import React, {Component} from 'react';
import {StyleSheet, View, Platform} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import VerticalScrollView from './VerticalScrollView';

var apiRootUrl =
  Platform.OS === 'ios' ? 'http://localhost:9000' : 'http://10.0.2.2:9000';

interface Props {}
interface State {
  images: any[];
  location: {lat?: number; long?: number};
}

class HomeScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      images: [],
      location: {},
    };
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
              images: prevState.images,
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

  async componentDidMount() {
    console.log('HomeScreen mounted.');
    await this.fetchImages()
      .then(() => {
        console.log('State after fetching images from server: ');
        console.log(this.state);
      })
      .catch((err: any) => {
        console.log('Err trying to fetch images: ');
        console.log(err);
      });
  }

  appendRootUrl(subPath: string, resource: string) {
    return apiRootUrl + '/' + subPath + (resource === '' ? '' : '/' + resource);
  }

  appendQueryParams(urlStr: string, params: any): string {
    let url = new URL(urlStr);
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key]),
    );
    return url.toString();
  }

  fetchImages() {
    return new Promise((resolve, reject) => {
      this.getCurrentLocation().then(() => {
        let url = this.appendRootUrl('images/all/location', '');
        let params = this.state.location;
        fetch(this.appendQueryParams(url, params))
          .then(res => {
            res.json().then(data => {
              var formattedImages: {url: string; replies: any}[] = [];

              data.forEach((obj: {replies: any[]; path: string}) => {
                var formattedReplies = obj.replies.map(reply => {
                  return {
                    url: this.appendRootUrl('images', reply.path),
                  };
                });

                var formattedObj = {
                  url: this.appendRootUrl('images', obj.path),
                  replies: formattedReplies,
                };
                formattedImages.push(formattedObj);
              });

              this.setState({images: formattedImages});
              resolve();
            });
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  render() {
    return (
      <View style={styles.sectionContainer}>
        {/** Wait to load images before rendering */}
        {this.state.images[0] && (
          <VerticalScrollView
            images={this.state.images}
            apiRootUrl={apiRootUrl}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
  },
});

export default HomeScreen;
