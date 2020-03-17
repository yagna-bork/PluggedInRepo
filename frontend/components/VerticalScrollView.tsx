import React, { Component } from 'react';
import {
  AppRegistry,
  ScrollView,
  Image, Text, View, TextInput,
  Dimensions } from 'react-native';


interface Props {
  images: any[]
}

interface State {

}

class VerticalScrollView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    var screenHeight = Dimensions.get('window').height;

    return (
      <ScrollView decelerationRate={0} snapToInterval={screenHeight} snapToAlignment={"center"} showsVerticalScrollIndicator={false}>
        {this.props.images.map(img => {
          return <Image
            style={{ width: screenHeight * (1920 / 1080), height: screenHeight }}
            source={{uri: img.url}}
          />
        })}
      </ScrollView>
    );
  }
}

export default VerticalScrollView;