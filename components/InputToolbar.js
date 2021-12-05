import React from "react";
import {
  InputToolbar,
  Actions,
  Composer,
  Send,
} from "react-native-gifted-chat";
import SendIcon from "../assets/svg/send.svg";
import AttachIcon from "../assets/svg/attach.svg";
import * as ImagePicker from "expo-image-picker";

export const renderInputToolbar = (props) => (
  <InputToolbar
    {...props}
    containerStyle={{
      backgroundColor: "#FFFFFF",
    }}
    primaryStyle={{ alignItems: "center" }}
  />
);

export const renderActions = (props) => (
  <Actions
    {...props}
    containerStyle={{
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 4,
      marginRight: 4,
      marginBottom: 0,
    }}
    icon={() => <AttachIcon width={20} height={20} />}
    options={{
      "Choose From Library": async () => {
        let image = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
          base64: true,
        });
        console.log(image.base64);
        console.log(image.uri);
      },
      "Take Using Camera": async () => {
        let image = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
          base64: true,
        });
        console.log(image.base64);
        console.log(image.uri);
      },
    }}
    optionTintColor="#550C18"
  />
);

export const renderComposer = (props) => (
  <Composer
    {...props}
    textInputStyle={{
      color: "#000000",
      backgroundColor: "#FFFFFF",
      borderRadius: 10,
      padding: 10,
      marginLeft: 0,
      fontFamily: "Raleway_Regular",
      fontSize: 18,
    }}
  />
);

export const renderSend = (props) => (
  <Send
    {...props}
    disabled={!props.text}
    containerStyle={{
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 4,
    }}
  >
    <SendIcon width={20} height={20} />
  </Send>
);
