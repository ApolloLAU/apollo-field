import React, { Component } from "react";
import { Text, View } from "react-native";
import styles from "./utils/Styles";
import * as Font from "expo-font";
import { Raleway_400Regular } from "@expo-google-fonts/raleway";
import AppLoading from "expo-app-loading";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingComplete: false,
    };
  }

  async unCacheResources() {
    await Font.loadAsync({
      Raleway_400Regular,
    });
  }

  render() {
    return this.state.loadingComplete ? (
      <View style={styles.container}>
        <Text style={styles.textStyleMedium}>Loading Complete</Text>
      </View>
    ) : (
      <AppLoading
        startAsync={async () => await this.unCacheResources()}
        onFinish={() => this.setState({ loadingComplete: true })}
        onError={console.warn}
      />
    );
  }
}

export default App;
