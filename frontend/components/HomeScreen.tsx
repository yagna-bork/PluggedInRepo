import React, {Component} from 'react';
import {StyleSheet, View, Platform} from 'react-native';

import VerticalScrollView from './VerticalScrollView';

var apiRootUrl =
  Platform.OS === 'ios' ? 'http://localhost:9000' : 'http://10.0.2.2:9000';

interface Props {}
interface State {
  images: any[];
}

class HomeScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      images: [],
    };
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

  fetchImages() {
    return new Promise((resolve, reject) => {
      fetch(this.appendRootUrl('images/all/location', ''))
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
  }

  render() {
    return (
      <View style={styles.sectionContainer}>
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
    paddingHorizontal: 24,
  },
});

export default HomeScreen;
