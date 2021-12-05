import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  TextInput,
  Pressable,
} from "react-native";
import styles from "../utils/Styles";
import BluetoothIcon from "../assets/svg/bluetooth_blue.svg";
import ScanIcon from "../assets/svg/scan.svg";
import AddIcon from "../assets/svg/add.svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
import { API } from "../api/API";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingComponent from "../components/LoadingComponent";
import HeaderProfile from "../components/HeaderProfile";

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

      editType: "Info",
      showDatePicker: false,

      editName: "",
      editDOB: "",
      editAddress: "",
      editPhoneNumber: "",
      editOldPassword: "",
      editNewPassword: "",
      editNewPasswordConfirm: "",
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
    let user = await API.getLoggedInUser();
    let worker = await API.getWorkerForUser(user);

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

  /*
  TODO: LOGOUT
  */
  async logout() {
    console.log("Logout");
  }

  /*
  TODO: LOGOUT
  */
  async editProfileInformation() {
    console.log("Edit Profile");

    let name = this.state.editName;
    let dob = this.state.editDOB;
    let address = this.state.editAddress;
    let phoneNumber = this.state.editPhoneNumber;
  }

  /*
  TODO: LOGOUT
  */
  async editPassword() {
    console.log("Edit Password");

    let oldPassword = this.state.editOldPassword;
    let newPassword = this.state.editNewPassword;
    let confirmPassword = this.state.editNewPasswordConfirm;
  }

  render() {
    return this.state.loading ? (
      <LoadingComponent />
    ) : (
      <View style={styles.container}>
        <HeaderProfile
          onLogoutPress={async () => {
            await this.logout();
          }}
          onEditProfilePress={() => {
            this.setState({ settingsModalOpen: true });
          }}
        />
        <View>
          <View
            style={{
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
              style={{ justifyContent: "center", alignItems: "center" }}
              onPress={() => this.setState({ statusModalOpen: true })}
            >
              <Image
                source={{ uri: this.state.worker.getImgURL() }}
                style={{
                  width: 125,
                  height: 125,
                  borderRadius: 100,
                  borderWidth: 3,
                  borderColor: this.state.worker.statusColor,
                }}
              />
            </TouchableOpacity>
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
                  alignItems: "center",
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
                  onPress={async () => {
                    await this.scanForDevices();
                  }}
                >
                  <ScanIcon width={25} height={25} fill="#294C60" />
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
          </View>
        </View>
        <Modal
          isVisible={this.state.settingsModalOpen}
          useNativeDriver
          swipeDirection="down"
          statusBarTranslucent
          onSwipeThreshold={200}
          onSwipeComplete={() => this.setState({ settingsModalOpen: false })}
          onBackdropPress={() => this.setState({ settingsModalOpen: false })}
          style={{ margin: 0 }}
        >
          <View style={[styles.bottomModalContainer, { height: "55%" }]}>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ settingsModalOpen: false });
                  }}
                >
                  <Text style={styles.semibold18}>Cancel</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable
                    style={{
                      backgroundColor: "#F2F2F2",
                      borderTopLeftRadius: 10,
                      borderBottomLeftRadius: 10,
                      padding: 10,
                      opacity: this.state.editType === "Info" ? 0.4 : 1,
                    }}
                    onPress={() => {
                      this.setState({ editType: "Info" });
                    }}
                  >
                    <Text style={styles.semibold15}>Information</Text>
                  </Pressable>
                  <Pressable
                    style={{
                      backgroundColor: "#F2F2F2",
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 10,
                      padding: 10,
                      opacity: this.state.editType === "Pass" ? 0.4 : 1,
                    }}
                    onPress={() => {
                      this.setState({ editType: "Pass" });
                    }}
                  >
                    <Text style={styles.semibold15}>Password</Text>
                  </Pressable>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    this.state.editType == "Info"
                      ? await this.editProfileInformation()
                      : await this.editPassword();
                  }}
                >
                  <Text style={styles.semibold18}>Done</Text>
                </TouchableOpacity>
              </View>
              {this.state.editType == "Info" ? (
                <View>
                  <Text style={styles.editTitleStyle}>Full Name</Text>
                  <TextInput
                    style={styles.editTextInput}
                    defaultValue={this.state.worker.getFormattedName()}
                    onChangeText={(editName) => {
                      this.setState({ editName });
                    }}
                  />
                  <Text style={styles.editTitleStyle}>Date Of Birth</Text>
                  <Pressable
                    onPress={() => this.setState({ showDatePicker: true })}
                  >
                    <View pointerEvents="none">
                      <TextInput
                        style={styles.editTextInput}
                        defaultValue={new Date().toDateString()}
                        enabled={false}
                        onPress={() => {
                          this.setState({ showDatePicker: true });
                        }}
                      />
                    </View>
                  </Pressable>

                  {this.state.showDatePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display="default"
                      style={{
                        flex: 1.5,
                      }}
                      onChange={(event, dob) => {
                        this.setState({ editDOB: dob, showDatePicker: false });
                      }}
                    />
                  )}
                  <Text style={styles.editTitleStyle}>Address</Text>
                  <TextInput
                    style={styles.editTextInput}
                    defaultValue={""}
                    onChangeText={(editAddress) => {
                      this.setState({ editAddress });
                    }}
                  />
                  <Text style={styles.editTitleStyle}>Phone Number</Text>
                  <TextInput
                    style={styles.editTextInput}
                    defaultValue={""}
                    onChangeText={(editPhoneNumber) => {
                      this.setState({ editPhoneNumber });
                    }}
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.editTitleStyle}>Old Password</Text>
                  <TextInput
                    style={styles.editTextInput}
                    secureTextEntry
                    defaultValue={""}
                    onChangeText={(editOldPassword) => {
                      this.setState({ editOldPassword });
                    }}
                  />
                  <Text style={styles.editTitleStyle}>New Password</Text>
                  <TextInput
                    style={styles.editTextInput}
                    secureTextEntry
                    defaultValue={""}
                    onChangeText={(editNewPassword) => {
                      this.setState({ editNewPassword });
                    }}
                  />
                  <Text style={styles.editTitleStyle}>Confirm Password</Text>
                  <TextInput
                    style={styles.editTextInput}
                    secureTextEntry
                    defaultValue={""}
                    onChangeText={(editNewPasswordConfirm) => {
                      this.setState({ editNewPasswordConfirm });
                    }}
                  />
                </View>
              )}
            </View>
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
      </View>
    );
  }
}

export default ProfileScreen;
