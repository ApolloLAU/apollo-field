import React, { Component } from "react";
import { SafeAreaView, Text } from "react-native";
import styles from "../utils/Styles";
import { GiftedChat } from "react-native-gifted-chat";
import { API, ChatMessage, Mission } from "../api/API";
import LoadingComponent from "../components/LoadingComponent";

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

  onSend(newMessage) {
    // console.log("messages", newMessage);
    if (this.state.currentWorker) {
      let msg = new ChatMessage();
      msg.setMessage(newMessage[0].text);
      msg.setSender(this.state.currentWorker);
      msg.setMission(this.state.mission.id);
      msg.save();
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
