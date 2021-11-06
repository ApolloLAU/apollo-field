import React, { Component } from "react";
import { View, Text } from "react-native";
import styles from "../utils/Styles";

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>Chat</Text>
      </View>
    );
  }
}

export default ChatScreen;
