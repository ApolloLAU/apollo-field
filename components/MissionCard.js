import React, { Component } from "react";
import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import styles from "../utils/Styles";

class MissionCard extends Component {
  render() {
    return (
      <TouchableOpacity style={innerStyles.container}>
        <Image
          source={require("../assets/png/apollo_splash.png")}
          style={{ width: 90, height: 90, marginBottom: 10 }}
        />
        <Text style={[styles.semibold15, { color: "#550C18" }]}>
          {this.props.mission.name}
        </Text>
        <Text style={[styles.semibold15, { color: "#550C18" }]}>
          {this.props.mission.location}
        </Text>
      </TouchableOpacity>
    );
  }
}

export default MissionCard;

const innerStyles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    width: 250,
    height: 150,
    borderRadius: 10,
    padding: 20,
    margin: 20,
    elevation: 7,
    justifyContent: "center",
    alignItems: "center",
  },
});
