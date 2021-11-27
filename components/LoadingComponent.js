import React, { Component } from "react";
import { View, Image } from "react-native";
import styles from "../utils/Styles";

class LoadingComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Image
          source={require("../assets/png/apollo.png")}
          style={{ width: 150 }}
          resizeMode="contain"
        />
      </View>
    );
  }
}

export default LoadingComponent;
