import React, { Component } from "react";
import { View, Text } from "react-native";
import styles from "../utils/Styles";

class MissionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>Mission</Text>
      </View>
    );
  }
}

export default MissionScreen;
