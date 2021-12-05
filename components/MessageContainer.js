import React from "react";
import { View, Text } from "react-native";
import { Avatar, Bubble, Message, MessageText } from "react-native-gifted-chat";

export const renderAvatar = (props) => <Avatar {...props} />;

export const renderBubble = (props) => (
  <Bubble
    {...props}
    wrapperStyle={{
      left: { backgroundColor: "#F2F2F2", padding: 2 },
      right: { backgroundColor: "#550C18", padding: 2 },
    }}
  />
);

export const renderMessage = (props) => <Message {...props} />;

export const renderMessageText = (props) => (
  <MessageText
    {...props}
    textStyle={{
      left: { color: "#000000" },
      right: { color: "#FFFFFF" },
    }}
    time
    customTextStyle={{ fontSize: 18, fontFamily: "Raleway_Regular" }}
  />
);
