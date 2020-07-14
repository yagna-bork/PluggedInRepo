import React, {Component} from 'react';
import {ScrollView, Image, Dimensions, ActivityIndicator} from 'react-native';

import {Image as LazyImage} from 'react-native-elements';

interface Props {
  images: any[];
  apiRootUrl: string;
}

interface State {}

class VerticalScrollView extends Component<Props, State> {
  render() {
    var screenHeight = Dimensions.get('window').height;
    var screenWidth = Dimensions.get('window').width;

    return (
      <ScrollView
        decelerationRate={0}
        snapToInterval={screenHeight}
        snapToAlignment="center"
        showsVerticalScrollIndicator={false}>
        {/* TODO: only load when in view port (or near?) */}
        {/* Dynamically generated parent Images and replies */}
        {this.props.images.map(img => {
          return (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate={0}
              snapToInterval={screenWidth} //your element width
              snapToAlignment="center">
              <Image
                style={{width: screenWidth, height: screenHeight}}
                source={{uri: img.url}}
              />
              {img.replies.map((reply: {url: string}) => {
                return (
                  <LazyImage
                    style={{width: screenWidth, height: screenHeight}}
                    source={{uri: reply.url}}
                    PlaceholderContent={<ActivityIndicator />}
                  />
                );
              })}
            </ScrollView>
          );
        })}
      </ScrollView>
    );
  }
}

//test comment

export default VerticalScrollView;
