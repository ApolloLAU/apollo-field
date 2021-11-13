import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import styles from "../utils/Styles";
import MenuIcon from "../assets/svg/menu.svg";
import BluetoothIcon from "../assets/svg/bluetooth_blue.svg";
import CompletedIcon from "../assets/svg/completed.svg";
import MissionCard from "../components/MissionCard";
import Modal from "react-native-modal";

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      settingsModalOpen: false,
      statusModalOpen: false,
      worker: {},
      connectedDevices: [
        {
          id: "ApolloECG1",
          name: "ECG",
          status: "No readings yet",
        },
        {
          id: "ApolloECG2",
          name: "ECG",
          status: "No readings yet",
        },
      ],
    };
  }

  async componentDidMount() {
    let worker = await this.getCurrentWorker();
    this.setState({ worker, loading: false });
  }

  getCurrentWorker() {
    let worker = {
      fullName: "Joe Smith",
      profilePicture: require("../assets/png/frs-logo-low.png"),
      district: "Beirut District D003",
      status: "online",
      statusColor: "",
      completedMissions: [
        {
          name: "Mission 1",
          location: "Location 1",
        },
        {
          name: "Mission 2",
          location: "Location 2",
        },
        {
          name: "Mission 3",
          location: "Location 3",
        },
      ],
    };

    switch (worker.status) {
      case "online":
        worker.statusColor = "#00FF19";
        break;
      case "busy":
        worker.statusColor = "#FFA200";
        break;
      case "away":
        worker.statusColor = "#FF0000";
        break;
      case "offline":
        worker.statusColor = "#7E7E7E";
        break;
    }

    return new Promise((resolve) => {
      resolve(worker);
    });
  }

  render() {
    return this.state.loading ? (
      <View></View>
    ) : (
      <SafeAreaView style={styles.container}>
        <View>
          <View
            style={{
              flexDirection: "row",
              marginVertical: 20,
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{ padding: 20 }}
              onPress={() => {
                this.setState({ settingsModalOpen: true });
              }}
            >
              <MenuIcon width={25} height={25} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ justifyContent: "center", alignItems: "center" }}
              onPress={() => this.setState({ statusModalOpen: true })}
            >
              <Image
                source={this.state.worker.profilePicture}
                style={{
                  width: 125,
                  height: 125,
                  borderRadius: 100,
                  borderWidth: 3,
                  borderColor: this.state.worker.statusColor,
                }}
              />
            </TouchableOpacity>
            <View style={{ width: 65 }} />
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <Text style={[styles.semibold25, { color: "#550C18" }]}>
              {this.state.worker.fullName}
            </Text>
            <Text style={[styles.semibold13, { color: "#550C18" }]}>
              {this.state.worker.district}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <View style={{ marginEnd: 10 }}>
                  <BluetoothIcon width={25} height={25} />
                </View>
                <Text style={[styles.semibold20, { color: "#294C60" }]}>
                  Saved Devices
                </Text>
              </View>

              {this.state.connectedDevices.map((device, deviceIndex) => (
                <View key={deviceIndex}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={[styles.regular_italic15, { color: "#294C60" }]}
                    >
                      {device.name}
                    </Text>
                    <Text
                      style={[
                        styles.semibold13,
                        { color: "#550C18", marginStart: 30 },
                      ]}
                    >
                      {device.status}
                    </Text>
                  </View>
                  <View style={styles.separator} />
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <View style={{ marginEnd: 10 }}>
                <CompletedIcon width={25} height={25} />
              </View>
              <Text style={[styles.semibold20, { color: "#294C60" }]}>
                Completed Missions
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {this.state.worker.completedMissions.map(
                (mission, missionIndex) => (
                  <MissionCard key={missionIndex} mission={mission} />
                )
              )}
            </ScrollView>
          </View>
        </View>
        <Modal
          isVisible={this.state.settingsModalOpen}
          useNativeDriver
          swipeDirection="left"
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          statusBarTranslucent
          onSwipeThreshold={200}
          onSwipeComplete={() => this.setState({ settingsModalOpen: false })}
          onBackdropPress={() => this.setState({ settingsModalOpen: false })}
          style={{ margin: 0 }}
        >
          <View style={styles.sideModalContainer}>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            ></View>
          </View>
        </Modal>
        <Modal
          isVisible={this.state.statusModalOpen}
          useNativeDriver
          swipeDirection="down"
          statusBarTranslucent
          onSwipeThreshold={200}
          onSwipeComplete={() => this.setState({ statusModalOpen: false })}
          onBackdropPress={() => this.setState({ statusModalOpen: false })}
          style={{ margin: 0 }}
        >
          <View style={styles.bottomModalContainer}>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={styles.modalIndicator} />
              <TouchableOpacity
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: "#00FF19",
                    marginBottom: 10,
                  },
                ]}
                onPress={() => {
                  let worker = this.state.worker;
                  worker.status = "online";
                  worker.statusColor = "#00FF19";
                  this.setState({ worker, statusModalOpen: false });
                }}
              >
                <Text style={styles.semibold15}>Available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusCard,
                  { backgroundColor: "#FFA200", marginBottom: 10 },
                ]}
                onPress={() => {
                  let worker = this.state.worker;
                  worker.status = "busy";
                  worker.statusColor = "#FFA200";
                  this.setState({ worker, statusModalOpen: false });
                }}
              >
                <Text style={styles.semibold15}>Busy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusCard,
                  { backgroundColor: "#FF0000", marginBottom: 10 },
                ]}
                onPress={() => {
                  let worker = this.state.worker;
                  worker.status = "away";
                  worker.statusColor = "#FF0000";
                  this.setState({ worker, statusModalOpen: false });
                }}
              >
                <Text style={styles.semibold15}>Away</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusCard,
                  { backgroundColor: "#7E7E7E", marginBottom: 10 },
                ]}
                onPress={() => {
                  let worker = this.state.worker;
                  worker.status = "offline";
                  worker.statusColor = "#7E7E7E";
                  this.setState({ worker, statusModalOpen: false });
                }}
              >
                <Text style={styles.semibold15}>Offline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

export default ProfileScreen;
