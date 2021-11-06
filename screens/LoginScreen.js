import React, { Component } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
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

  /*
  TODO: LOGIN FUNCTION
  */
  async login() {
    let email = this.state.email;
    let password = this.state.password;

    this.props.navigation.navigate("MainMenuScreen");
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{ justifyContent: "center", flex: 1, paddingHorizontal: 20 }}
        >
          <Text style={[styles.bold48, { color: "#550C18", marginBottom: 20 }]}>
            Login
          </Text>
          <View style={styles.textInputContainer}>
            <View style={{ marginHorizontal: 20 }}>
              <UserIcon width={20} height={20} fill="#000000" />
            </View>
            <View style={{ width: "100%" }}>
              <Text
                style={[styles.semibold13, { color: "#A78288", marginTop: 10 }]}
              >
                Email
              </Text>
              <TextInput
                style={[styles.textInput]}
                onChangeText={(email) => {
                  this.setState({ email });
                }}
              />
            </View>
          </View>
          <View style={styles.textInputContainer}>
            <View style={{ marginHorizontal: 20 }}>
              <PasswordIcon width={20} height={20} fill="#000000" />
            </View>
            <View style={{ width: "100%" }}>
              <Text
                style={[styles.semibold13, { color: "#A78288", marginTop: 10 }]}
              >
                Password
              </Text>
              <TextInput
                style={[styles.textInput]}
                secureTextEntry={true}
                onChangeText={(password) => {
                  this.setState({ password });
                }}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={async () => {
              await this.login();
            }}
          >
            <Text style={[styles.semibold20, { color: "#FFFFFF" }]}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default LoginScreen;
