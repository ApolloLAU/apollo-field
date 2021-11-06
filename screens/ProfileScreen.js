import React, { Component } from "react";
import { View, Text } from "react-native";
import styles from "../utils/Styles";

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>Profile</Text>
      </View>
    );
  }
}

export default ProfileScreen;
