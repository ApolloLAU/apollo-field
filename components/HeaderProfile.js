import React, { Component } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import LogoutIcon from "../assets/svg/logout.svg";
import EditIcon from "../assets/svg/edit.svg";

class HeaderProfile extends Component {
  render() {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: getStatusBarHeight() + 30,
        }}
      >
        <TouchableOpacity
          style={{ padding: 20 }}
          onPress={this.props.onEditProfilePress}
        >
          <EditIcon width={27} height={27} fill="#294C60" />
        </TouchableOpacity>
        <Image
          source={require("../assets/png/apollo_text.png")}
          style={{ height: "150%", width: 150 }}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={{ padding: 20 }}
          onPress={this.props.onLogoutPress}
        >
          <LogoutIcon width={25} height={25} fill="#294C60" />
        </TouchableOpacity>
      </View>
    );
  }
}

export default HeaderProfile;
