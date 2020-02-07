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
    return (
      <ScrollView>
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: this.props.imageUrls[0] }}
        />
      </ScrollView>
    );
  }
}

export default VerticalScrollView;