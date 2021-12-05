import React, { Component } from "react";
import { SafeAreaView, Text } from "react-native";
import styles from "../utils/Styles";
import {Actions, GiftedChat} from "react-native-gifted-chat";
import {
  renderInputToolbar,
  renderActions,
  renderComposer,
  renderSend,
} from "../components/InputToolbar";
import {
  renderAvatar,
  renderBubble,
  renderMessage,
  renderMessageText,
  renderCustomView,
} from "../components/MessageContainer";
import { API, ChatMessage, Mission } from "../api/API";
import LoadingComponent from "../components/LoadingComponent";
import AttachIcon from "../assets/svg/attach.svg";
import * as ImagePicker from "expo-image-picker";
import * as Parse from 'parse/react-native';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      mission: undefined,
      currentWorker: undefined,
      chatSubscription: undefined,
      messages: [],
    };
  }

  async componentDidMount() {
    let missionActive = await this.getMissionStatus();
    if (missionActive !== undefined) {
      const q = ChatMessage.getMessageForMissionQuery(missionActive.id);
      const subscription = await q.subscribe();

      const currentMessages = await q.find();
      // console.log("found messages count", currentMessages.length);
      const neededMessages = currentMessages.map((m) => {
        return {
          _id: m.id,
          createdAt: m.createdAt,
          text: m.getMessage() || "",
          image: m.getImage(),
          user: {
            _id: m.getSender().id === this.state.currentWorker.id ? 1 : 2,
          },
        };
      });

      const newMessages = GiftedChat.append(
        this.state.messages,
        neededMessages
      );
      this.setState({ messages: newMessages });

      subscription.on("create", (msg) => {
        // console.log("received message!", msg.getMessage());
        if (msg.getSender().id !== this.state.currentWorker.id)
          this.setState({
            messages: GiftedChat.append(this.state.messages, [
              {
                _id: msg.id,
                createdAt: msg.createdAt,
                text: msg.getMessage(),
                user: { _id: 2 },
              },
            ]),
          });
      });

      this.setState({ subscription });
    }
    // console.log("mission:", missionActive);
    this.setState({ mission: missionActive, loading: false });
  }

  async componentWillUnmount() {
    if (this.state.chatSubscription) {
      this.state.chatSubscription.unsubscribe();
    }
  }

  async uploadImage(base64, uri) {
    if (base64 && uri) {
      console.log('received image!')
      const extension = uri.slice(-4); // get .png or .jpg
      const msg = {
        _id: "" + Math.random(),
        text: "",
        createdAt: new Date(),
        user: { _id: 1},
        base64: base64,
        ext: extension
      }
      await this.onSend([msg])
    }

  }

  async onSend(newMessage) {
    // console.log("messages", newMessage);
    if (this.state.currentWorker) {
      let msg = new ChatMessage();
      msg.setMessage(newMessage[0].text);
      if (newMessage[0].base64) {
        const file = new Parse.File("message" + newMessage[0].ext, {base64: newMessage[0].base64})
        await file.save()
        newMessage[0].image = file.url()
        msg.setImage(file)
      }
      msg.setSender(this.state.currentWorker);
      msg.setMission(this.state.mission.id);
      await msg.save();
    }
    this.setState({
      messages: GiftedChat.append(this.state.messages, newMessage),
    });
  }

  async getMissionStatus() {
    let user = await API.getLoggedInUser();
    let worker = await API.getWorkerForUser(user);

    this.setState({ currentWorker: worker });
    return await Mission.getWorkerActiveMission(worker);
  }

  render() {
    return this.state.loading ? (
      <LoadingComponent />
    ) : this.state.mission ? (
      <SafeAreaView style={styles.container}>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
          alwaysShowSend
          renderInputToolbar={renderInputToolbar}
          renderActions={(props) => (
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
                      // console.log(image.base64);
                      // console.log(image.uri);
                      await this.uploadImage(image.base64, image.uri);
                    },
                    "Take Using Camera": async () => {
                      let image = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        quality: 1,
                        base64: true,
                      });
                      // console.log(image.base64);
                      // console.log(image.uri);
                      await this.uploadImage(image.base64, image.uri);
                    },
                  }}
                  optionTintColor="#550C18"
              />
          )}
          renderComposer={renderComposer}
          renderSend={renderSend}
          renderAvatar={renderAvatar}
          renderBubble={renderBubble}
          renderMessage={renderMessage}
          renderMessageText={renderMessageText}
          // renderMessageImage
        />
      </SafeAreaView>
    ) : (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={[styles.semibold20, { color: "#550C18" }]}>
          No current mission active
        </Text>
      </View>
    );
  }
}

export default ChatScreen;
