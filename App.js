import React, { Component } from "react";
import * as Font from "expo-font";
import {
  Raleway_100Thin,
  Raleway_200ExtraLight,
  Raleway_300Light,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_800ExtraBold,
  Raleway_900Black,
} from "@expo-google-fonts/raleway";
import AppLoading from "expo-app-loading";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import MainMenuScreen from "./screens/MainMenuScreen";
import { API } from "./api/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingComplete: false,
    };
    console.log("IM HERE")
  }

  async componentDidMount() {
    console.log("HII!")
    API.initAPI();
  }

  async unCacheResources() {
    await Font.loadAsync({
      Raleway_Thin: Raleway_100Thin,
      Raleway_ELight: Raleway_200ExtraLight,
      Raleway_Light: Raleway_300Light,
      Raleway_Regular: Raleway_400Regular,
      Raleway_Medium: Raleway_500Medium,
      Raleway_Semibold: Raleway_600SemiBold,
      Raleway_Bold: Raleway_700Bold,
      Raleway_EBold: Raleway_800ExtraBold,
      Raleway_Black: Raleway_900Black,
    });

    // await AsyncStorage.clear();
  }

  render() {
    return this.state.loadingComplete ? (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="MainMenuScreen" component={MainMenuScreen} />
        </Stack.Navigator>
      </NavigationContainer>
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
