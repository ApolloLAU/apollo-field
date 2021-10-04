import React, { Component } from "react";
import { Text, View } from "react-native";
import styles from "./utils/styles";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingComplete: false,
    };
  }

  render() {
    return this.state.loadingComplete ? (
      <View style={styles.container}>
        <Text>Loading Complete</Text>
      </View>
    ) : (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
}

export default App;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
