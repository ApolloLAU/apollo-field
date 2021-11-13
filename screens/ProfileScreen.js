import React, { Component } from "react";
import { View, Text } from "react-native";
import styles from "../utils/Styles";
import * as Crypto from "expo-crypto";
import QRCode from "react-native-qrcode-svg";

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
