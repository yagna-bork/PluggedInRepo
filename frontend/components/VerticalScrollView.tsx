import React, { Component } from 'react';
import {
  AppRegistry,
  ScrollView,
  Image, Text, View, TextInput,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

interface Props {
  images: any[],
  apiRootUrl: string
}

import { Image as LazyImage } from 'react-native-elements';

interface State {

}

class VerticalScrollView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    var screenHeight = Dimensions.get('window').height;
    var screenWidth = Dimensions.get('window').width;

    //test if lazy loading working TODO: add time delay server end
    var repeatedReply = [];
    for (var i = 0; i < 25; i++) {
      repeatedReply.push(this.props.images[0].replies[0]);
    }

    return (
      <ScrollView decelerationRate={0} snapToInterval={screenHeight} snapToAlignment={"center"} showsVerticalScrollIndicator={false}>
        {/* 50 replies test horizontal scroll */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <Image
            style={{ width: screenWidth, height: screenHeight }}
            source={{ uri: this.props.images[0].url }}
          />
          {repeatedReply.map(reply => {
            return (<LazyImage
              style={{ width: screenWidth, height: screenHeight }}
              source={{ uri: reply.url }}
              PlaceholderContent={<ActivityIndicator />}
            />);
          })}
        </ScrollView>
        {/* TODO: only load when in view port (or near?) */}
        {/* Dynamically generated parent Images and replies */}
        {
          this.props.images.map(img => {
            return (
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {
                  <Image
                    style={{ width: screenWidth, height: screenHeight }}
                    source={{ uri: img.url }}
                  />
                }
                {
                  img.replies.map(reply => {
                    return (<LazyImage
                      style={{ width: screenWidth, height: screenHeight }}
                      source={{ uri: reply.url }}
                      PlaceholderContent={<ActivityIndicator />}
                    />);
                  })
                }
              </ScrollView>
            );
          })
        }
      </ScrollView>
    );
  }
}

//test comment

export default VerticalScrollView;