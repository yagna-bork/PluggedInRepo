import React, { Component } from 'react';
import {
  AppRegistry,
  ScrollView,
  Image, Text, View, TextInput,
  Dimensions, 
  TouchableOpacity} from 'react-native';


interface Props {
  images: any[],
  apiRootUrl: string
}

interface State {

}

class VerticalScrollView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.fetchReplies = this.fetchReplies.bind(this);
  }

  fetchReplies(parentId: string) {
    return new Promise((resolve, reject) => {
      fetch(this.props.apiRootUrl + `images/reply?parentId=${encodeURIComponent(parentId)}`).then(res => {
        res.json().then(replyNames => {
          var replyUrls: string[] = [];
          var imageUrlRoot = this.props.apiRootUrl + 'images/';

          replyNames.forEach(replyName => {
            replyUrls.push(imageUrlRoot + replyName);
          });

          //do something with them
          console.log("fetchReplies: ", replyUrls);
          resolve();
        }).catch(err => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  render() {
    var screenHeight = Dimensions.get('window').height;

    return (
      <ScrollView decelerationRate={0} snapToInterval={screenHeight} snapToAlignment={"center"} showsVerticalScrollIndicator={false}>
        {this.props.images.map(img => {
          console.log(img);
          return (<TouchableOpacity onPress={() => this.fetchReplies(img._id)}>
            <Image
              style={{ width: screenHeight * (1920 / 1080), height: screenHeight }}
              source={{ uri: img.url }}
            />
          </TouchableOpacity>);
        })}

        {/* {this.props.imageUrls.map(url => {
          return <Image
            style={{ width: screenHeight * (1920 / 1080), height: screenHeight }}
            source={{ uri: url }}
          />
        })} */}
      </ScrollView>
    );
  }
}

export default VerticalScrollView;