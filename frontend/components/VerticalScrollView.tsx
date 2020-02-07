import React, { Component } from 'react';
import {
  AppRegistry,
  ScrollView,
  Image, Text, View, TextInput,
  Dimensions } from 'react-native';


interface Props {
  imageUrls: string[]
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
      <ScrollView>
        <Image
          style={{ width: screenHeight * (1920 / 1080), height: screenHeight }}
          source={{ uri: this.props.imageUrls[0] }}
        />
      </ScrollView>
    );
  }
}

export default VerticalScrollView;