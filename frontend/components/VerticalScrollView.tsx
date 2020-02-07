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
      <ScrollView decelerationRate={0} snapToInterval={screenHeight} snapToAlignment={"center"}>
        {
          this.state.resultArray.map((item, key) => {
          let src = this.state.foodList.find(food => +food.id === item).src;
          return <Image key={key} style={{ flexDirection: "row" }} source={uri: src)} />;
          })}

        {this.props.imageUrls.map(url => {
          return <Image 
            style={{ width: screenHeight * (1920 / 1080), height: screenHeight }}
            source={{uri: url}}
          />
        })}
        <Image
          style={{ width: screenHeight * (1920 / 1080), height: screenHeight }}
          source={{ uri: this.props.imageUrls[0] }}
        />
        <Image
          style={{ width: screenHeight * (1920 / 1080), height: screenHeight }}
          source={{ uri: this.props.imageUrls[0] }}
        />
      </ScrollView>
    );
  }
}



export default VerticalScrollView;