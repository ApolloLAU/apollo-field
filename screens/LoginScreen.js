import React, { Component } from "react";
import { View, Text, TextInput } from "react-native";
import UserIcon from "../assets/svg/user.svg";
import PasswordIcon from "../assets/svg/padlock.svg";
import styles from "../utils/Styles";

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }
  render() {
    return (
      <View>
        <Text>Login</Text>
        <UserIcon width={20} height={20} fill="#000000" />
      </View>
    );
  }
}

export default LoginScreen;
