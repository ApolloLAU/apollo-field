import React, { Component } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import UserIcon from "../assets/svg/user.svg";
import PasswordIcon from "../assets/svg/padlock.svg";
import styles from "../utils/Styles";
import { API, Mission } from "../api/API";

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "petersakr.field",
      password: "test123",
    };
  }

  async componentDidMount() {
    const user = await API.getLoggedInUser();
    if (user) {
      try {
        const worker = await API.getWorkerForUser(user);
        if (worker) {
          const m = await Mission.getWorkerActiveMission(worker);
          if (m) {
            console.log("found a mission! setting status to online!")
            worker.setStatus("online");
          }
          await worker.save();
          console.log("worker already logged in. skipping login screen!");
          this.props.navigation.navigate("MainMenuScreen");
        }
      } catch (e) {}
    }
  }

  async login() {
    let email = this.state.email;
    let password = this.state.password;

    API.login(email, password)
      .then((user) => {
        console.log("user logged in!");
        if (user !== undefined) {
          return API.getWorkerForUser(user);
        }
      })
      .then(async (worker) => {
        console.log("got worker for user");
        if (worker.getRole() === "field_worker") {
          const m = await Mission.getWorkerActiveMission(worker);
          if (!m) {
            worker.setStatus("online");
          }
          await worker.save();
          console.log("login complete. navigating...");
          this.props.navigation.navigate("MainMenuScreen");
        }
      })
      .catch((e) => {
        console.log(e);
      });
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
                value={this.state.email}
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
                value={this.state.password}
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
