import React, { Component } from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import styles from "../utils/Styles";
import BluetoothIcon from "../assets/svg/bluetooth.svg";
import Modal from "react-native-modal";

class MissionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      patientInformationModalOpen: false,
      connectedDevices: [],
      mission: {},
    };
  }

  async getConnectedDevice() {
    let connectedDevices = [
      {
        id: "ApolloECG",
        name: "ECG",
        status: "No readings yet",
        action: "Read Data",
      },
      {
        id: "ApolloSPO2",
        name: "SPO2",
        status: "No readings yet",
        action: "Read Data",
      },
    ];
    this.setState({ connectedDevices });
  }

  async componentDidMount() {
    let mission = await this.getMissionInformation();
    await this.getConnectedDevice();
    this.setState({ mission });

    this.setState({ loading: false });
  }

  async getMissionInformation() {
    let mission = {
      id: "00432",
      civilian: "John Doe",
      location: "Location of Civilian - Street - District",
      initialDiagnosis: "Stroke - Faint Pulse",
    };

    return new Promise((resolve) => {
      resolve(mission);
    });
  }

  deviceAction(device) {
    console.log("Action for device", device.id);
  }

  updatePatientInformation() {
    this.setState({ patientInformationModalOpen: true });
  }

  openMaps() {
    console.log("Open Maps");
  }

  render() {
    return this.state.loading ? (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    ) : (
      <View style={styles.container}>
        <ImageBackground
          source={require("../assets/png/frs-logo-low.png")}
          style={{
            height: "100%",
            flex: 1,
          }}
          imageStyle={{ opacity: 0.03 }}
          resizeMode={"contain"}
        >
          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={[styles.bold30, { color: "#550C18", marginBottom: 15 }]}
            >
              Mission {this.state.mission.id}
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.semibold25, { color: "#550C18" }]}>
                Civilian
              </Text>
              <Text style={[styles.medium15, { color: "#294C60" }]}>
                {this.state.mission.civilian}
              </Text>
              <Text style={[styles.semibold25, { color: "#550C18" }]}>
                Location
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.openMaps();
                }}
                style={{ paddingVertical: 5 }}
              >
                <Text style={[styles.medium15, { color: "#294C60" }]}>
                  {this.state.mission.location}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.semibold25, { color: "#550C18" }]}>
                Initial Diagnosis
              </Text>
              <Text style={[styles.medium15, { color: "#294C60" }]}>
                {this.state.mission.initialDiagnosis}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={[styles.semibold25, { color: "#550C18", marginEnd: 10 }]}
              >
                Readings
              </Text>
              <View style={{ marginTop: 5 }}>
                <BluetoothIcon width={20} height={20} fill="#000000" />
              </View>
            </View>
            <Text style={[styles.semibold15, { color: "#550C18" }]}>
              Connected Devices
            </Text>
            <View style={{ marginBottom: 20 }}>
              {this.state.connectedDevices.map((device, deviceIndex) => (
                <View
                  key={deviceIndex}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={[
                      styles.regular_italic15,
                      { color: "#294C60", flex: 1 },
                    ]}
                  >
                    {device.name}
                  </Text>
                  <Text
                    style={[styles.semibold13, { color: "#550C18", flex: 2 }]}
                  >
                    {device.status}
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.deviceAction(device)}
                    style={[styles.buttonContainer, { height: 40, flex: 1 }]}
                  >
                    <Text style={[styles.semibold13, { color: "#FFFFFF" }]}>
                      {device.action}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <Text style={[styles.semibold25, { color: "#550C18" }]}>
              Mission Infomation
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.semibold15, { color: "#550C18", flex: 3 }]}>
                Patient Information
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.updatePatientInformation();
                }}
                style={[styles.buttonContainer, { height: 40, flex: 1 }]}
              >
                <Text style={[styles.semibold13, { color: "#FFFFFF" }]}>
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
        <Modal
          isVisible={this.state.patientInformationModalOpen}
          swipeDirection="down"
          onSwipeThreshold={200}
          onSwipeComplete={() =>
            this.setState({ patientInformationModalOpen: false })
          }
          onBackdropPress={() =>
            this.setState({ patientInformationModalOpen: false })
          }
          style={{ margin: 0 }}
        >
          <View style={styles.bottomModalContainer}>
            <View style={styles.modalIndicator} />
          </View>
        </Modal>
      </View>
    );
  }
}

export default MissionScreen;
