import React, { Component } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "./ProfileScreen";
import ChatScreen from "./ChatScreen";
import MissionScreen from "./MissionScreen";

const Tab = createBottomTabNavigator();

class MainMenuScreen extends Component {
  render() {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="ChatScreen" component={ChatScreen} />
        <Tab.Screen name="MissionScreen" component={MissionScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }
}

export default MainMenuScreen;
