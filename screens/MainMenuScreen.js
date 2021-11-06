import React, { Component } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "./ProfileScreen";
import ChatScreen from "./ChatScreen";
import MissionScreen from "./MissionScreen";
import ChatScreenIcon from "../assets/svg/chat.svg";
import ChatScreenIconHighlighted from "../assets/svg/chat-highlighted.svg";
import MissionScreenIcon from "../assets/svg/mission.svg";
import MissionScreenIconHighlighted from "../assets/svg/mission-highlighted.svg";
import ProfileScreenIcon from "../assets/svg/profile.svg";
import ProfileScreenIconHighlighted from "../assets/svg/profile-highlighted.svg";

const Tab = createBottomTabNavigator();

class MainMenuScreen extends Component {
  render() {
    return (
      <Tab.Navigator
        initialRouteName="MissionScreen"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            if (route.name === "MissionScreen") {
              return focused ? (
                <MissionScreenIconHighlighted
                  width={25}
                  height={25}
                  fill="#000000"
                />
              ) : (
                <MissionScreenIcon width={25} height={25} fill="#000000" />
              );
            } else if (route.name === "ProfileScreen") {
              return focused ? (
                <ProfileScreenIconHighlighted
                  width={25}
                  height={25}
                  fill="#000000"
                />
              ) : (
                <ProfileScreenIcon width={25} height={25} fill="#000000" />
              );
            } else {
              return focused ? (
                <ChatScreenIconHighlighted
                  width={25}
                  height={25}
                  fill="#000000"
                />
              ) : (
                <ChatScreenIcon width={25} height={25} fill="#000000" />
              );
            }
          },
          tabBarLabel: () => {
            return null;
          },
        })}
      >
        <Tab.Screen name="ChatScreen" component={ChatScreen} />
        <Tab.Screen name="MissionScreen" component={MissionScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }
}

export default MainMenuScreen;
