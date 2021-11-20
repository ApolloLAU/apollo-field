import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
} from "react-native";
import styles from "../utils/Styles";
import MenuIcon from "../assets/svg/menu.svg";
import BluetoothIcon from "../assets/svg/bluetooth_blue.svg";
import ScanIcon from "../assets/svg/scan.svg";
import AddIcon from "../assets/svg/add.svg";
import TrashIcon from "../assets/svg/trash.svg";
import CompletedIcon from "../assets/svg/completed.svg";
import MissionCard from "../components/MissionCard";
import Modal from "react-native-modal";
import {API} from "../api/API";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      scanningModalOpen: false,
      settingsModalOpen: false,
      statusModalOpen: false,
      worker: undefined,
      color: "#7E7E7E",
      connectedDevices: [],
      scanning: false,
      availableDevices: [],
    };
  }

  async componentDidMount() {
    let worker = await this.getCurrentWorker();
    await this.getPairedDevices();
    this.setState({ worker, loading: false });
  }

  async requestAccessFineLocationPermission() {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Access fine location required for discovery",
        message:
          "In order to perform discovery, you must enable/allow " +
          "fine location access.",
        buttonNeutral: 'Ask Me Later"',
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  async getPairedDevices() {
    let available = await RNBluetoothClassic.isBluetoothAvailable();
    let enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (available && enabled) {
      let connectedDevices = await RNBluetoothClassic.getBondedDevices();
      for (let device of connectedDevices) {
        let cacheDevice = await AsyncStorage.getItem(`@${device.id}`).catch();
        if (cacheDevice) {
          cacheDevice = JSON.parse(cacheDevice);
          Object.assign(device, {
            addedDate: cacheDevice.addedDate,
            status: "No readings yet",
          });
        }
      }
      this.setState({ connectedDevices });
    }
  }

  async scanForDevices() {
    this.setState({ scanningModalOpen: true });

    await this.requestAccessFineLocationPermission();

    this.setState({ scanning: true });
    let unpaired = await RNBluetoothClassic.startDiscovery();

    let availableDevices = [];

    for (let dev of unpaired) {
      if (dev.id !== dev.name) {
        availableDevices.push(dev);
      }
    }

    this.setState({ availableDevices });
  }

  async connectToDevice(device) {
    await device.connect();

    let cacheDevice = {
      id: device.id,
      name: device.name,
      addedDate: new Date(),
      status: "No readings yet",
    };

    Object.assign(device, {
      addedDate: new Date(),
      status: "No readings yet",
    });

    let connectedDevices = this.state.connectedDevices;
    connectedDevices.push(device);

    await AsyncStorage.setItem(`@${device.id}`, JSON.stringify(cacheDevice));

    this.setState({ connectedDevices, scanningModalOpen: false });
  }
  async getCurrentWorker() {
    // let worker = {
    //   fullName: "Joe Smith",
    //   profilePicture: require("../assets/png/frs-logo-low.png"),
    //   district: "Beirut District D003",
    //   status: "online",
    //   statusColor: "",
    //   completedMissions: [
    //     {
    //       name: "Mission 1",
    //       location: "Location 1",
    //     },
    //     {
    //       name: "Mission 2",
    //       location: "Location 2",
    //     },
    //     {
    //       name: "Mission 3",
    //       location: "Location 3",
    //     },
    //   ],
    // };
    let user = await API.getLoggedInUser();
    let worker = await API.getWorkerForUser(user);
    console.log('worker', worker)

    switch (worker.getStatus()) {
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
    return worker;
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
                source={{uri: this.state.worker.getImgURL()}}
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
              {this.state.worker.getFormattedName()}
            </Text>
            <Text style={[styles.semibold13, { color: "#550C18" }]}>
              {this.state.worker.getDistrict().getName()}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <View style={{ marginEnd: 10 }}>
                    <BluetoothIcon width={25} height={25} />
                  </View>
                  <Text style={[styles.semibold20, { color: "#294C60" }]}>
                    Saved Devices
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    marginBottom: 10,
                    alignItems: "center",
                  }}
                  onPress={async () => {
                    await this.scanForDevices();
                  }}
                >
                  <View style={{ marginEnd: 10 }}>
                    <ScanIcon width={25} height={25} fill="#294C60" />
                  </View>
                  <Text style={[styles.semibold20, { color: "#294C60" }]}>
                    Scan
                  </Text>
                </TouchableOpacity>
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
                      Added on {new Date(device.addedDate).toDateString()}
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
            </View>
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
        <Modal
          isVisible={this.state.scanningModalOpen}
          useNativeDriver
          statusBarTranslucent
          onSwipeThreshold={200}
          onBackdropPress={async () => {
            this.setState({ scanningModalOpen: false });
            await RNBluetoothClassic.cancelDiscovery();
          }}
          style={{ margin: 0 }}
        >
          <View style={styles.bottomModalContainerFull}>
            <Text
              style={[
                styles.semibold20,
                { color: "#294C60", marginBottom: 20, marginTop: 10 },
              ]}
            >
              Available Devices
            </Text>
            {this.state.availableDevices.length == 0 ? (
              <View>
                <Text
                  style={[
                    styles.semibold15,
                    { color: "#294C60", marginTop: -15 },
                  ]}
                >
                  {this.state.scanning
                    ? "Scanning..."
                    : "No Devices Were Detected"}
                </Text>
              </View>
            ) : (
              this.state.availableDevices.map((device, deviceIndex) => (
                <View key={deviceIndex}>
                  <View
                    style={{
                      marginTop: -15,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[styles.regular_italic15, { color: "#294C60" }]}
                    >
                      {device.name}
                    </Text>
                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={async () => {
                        await this.connectToDevice(device);
                      }}
                    >
                      <AddIcon width={20} height={20} fill="#000000" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.separator} />
                </View>
              ))
            )}
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

export default ProfileScreen;
