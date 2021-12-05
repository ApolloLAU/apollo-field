import React, { Component } from "react";
import { View, Image } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";

class Header extends Component {
  render() {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: getStatusBarHeight() + 30,
        }}
      >
        <Image
          source={require("../assets/png/apollo_text.png")}
          style={{ height: "150%", marginTop: 5 }}
          resizeMode="contain"
        />
      </View>
    );
  }
}

export default Header;
