import React, { Component } from "react";
import { View, Text, SafeAreaView } from "react-native";
import styles from "../utils/Styles";
import { GiftedChat } from "react-native-gifted-chat";
import {
  MessageText,
  MessageImage,
  Time,
  utils,
} from "react-native-gifted-chat";

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      missionActive: false,
      messages: [
        {
          _id: 1,
          text: "My message",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "Base App",
          },
          // image: "https://facebook.github.io/react/img/logo_og.png",
          // You can also add a video prop:
          // Mark the message as sent, using one tick
          sent: true,
          // Mark the message as received, using two tick
          received: true,
          // Mark the message as pending with a clock loader
          pending: true,
          // Any additional custom parameters are passed through
        },
      ],
    };
  }

  async componentDidMount() {
    let missionActive = await this.getMissionStatus();
    this.setState({ missionActive, loading: false });
  }

  onSend(newMessage) {
    this.setState({
      messages: GiftedChat.append(this.state.messages, newMessage),
    });
  }

  getMissionStatus() {
    return new Promise((resolve) => {
      resolve(true);
    });
  }

  render() {
    return this.state.loading ? (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    ) : this.state.missionActive ? (
      <SafeAreaView style={styles.container}>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
          alwaysShowSend
        />
      </SafeAreaView>
    ) : (
      <SafeAreaView style={styles.container}>
        <Text>No current mission active</Text>
      </SafeAreaView>
    );
  }
}

export default ChatScreen;
