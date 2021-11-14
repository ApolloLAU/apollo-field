import React, { Component } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import styles from "../utils/Styles";

class Chip extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={[
          this.props.style,
          this.props.pressed ? styles.chipPressed : styles.chipUnpressed,
        ]}
      >
        <Text
          style={[styles.semibold15, { color: "#FFFFFF", textAlign: "center" }]}
        >
          {this.props.chipText}
        </Text>
      </TouchableOpacity>
    );
  }
}

export default Chip;
