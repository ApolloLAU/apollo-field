import React, { Component } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import styles from "../utils/Styles";
import BluetoothIcon from "../assets/svg/bluetooth.svg";
import Modal from "react-native-modal";
import Carousel from "react-native-snap-carousel";
import BottomModalIndexIndicator from "../components/BottomModalIndexIndicator";

class MissionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      civilianInformationModalOpen: false,
      connectedDevices: [],
      mission: {},
      activeIndex: 0,
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
    let civilian1 = {
      id: 1,
      name: "John Doe",
      dob: "1/1/1970",
      address: "Address",
      emergencyContact: "+961 1 234 567",
      bloodType: "A+",
      height: "185cm",
      weight: "85kg",
      allergies: "Allergty A, Allergy B",
      chronicIllnesses: "Illness A, Illness B",
    };
    let civilian2 = {
      id: 1,
      name: "John Doe",
      dob: "1/1/1970",
      address: "Address",
      emergencyContact: "+961 1 234 567",
      bloodType: "A+",
      height: "185cm",
      weight: "85kg",
      allergies: "Allergty A, Allergy B",
      chronicIllnesses: "Illness A, Illness B",
    };
    let civilian3 = {
      id: 1,
      name: "John Doe",
      dob: "1/1/1970",
      address: "Address",
      emergencyContact: "+961 1 234 567",
      bloodType: "A+",
      height: "185cm",
      weight: "85kg",
      allergies: "Allergty A, Allergy B",
      chronicIllnesses: "Illness A, Illness B",
    };
    let mission = {
      id: "00432",
      civilians: [civilian1, civilian2, civilian3],
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

  updateCivilianInformation() {
    this.setState({ civilianInformationModalOpen: true });
  }

  openMaps() {
    console.log("Open Maps");
  }

  rendercivilianInformation = ({ item }) => {
    let civilianTitleStyle = [
      styles.semibold20,
      { color: "#550C18", marginBottom: 15 },
    ];
    let titleStyle = [styles.semibold18, { color: "#550C18", marginBottom: 5 }];
    let textInputStyle = [
      styles.textInputAlternate,
      styles.textInputContainer,
      { width: "100%" },
    ];

    let mission = this.state.mission;

    return (
      <ScrollView style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={civilianTitleStyle}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => {
              this.setState({ mission, civilianInformationModalOpen: false });
            }}
          >
            <Text style={civilianTitleStyle}>Save</Text>
          </TouchableOpacity>
        </View>
        <Text style={titleStyle}>Full Name</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.name}
          onChangeText={(name) => {
            item.name = name;
          }}
        />
        <Text style={titleStyle}>Date Of Birth</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.dob}
          onChangeText={(dob) => {
            item.dob = dob;
          }}
        />
        <Text style={titleStyle}>Address</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.address}
          onChangeText={(address) => {
            item.address = address;
          }}
        />
        <Text style={titleStyle}>Emergency Contact</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.emergencyContact}
          onChangeText={(emergencyContact) => {
            item.emergencyContact = emergencyContact;
          }}
        />
        <Text style={titleStyle}>Blood Type</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.bloodType}
          onChangeText={(bloodType) => {
            item.bloodType = bloodType;
          }}
        />
        <Text style={titleStyle}>Height</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.height}
          onChangeText={(height) => {
            item.height = height;
          }}
        />
        <Text style={titleStyle}>Weight</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.weight}
          onChangeText={(weight) => {
            item.weight = weight;
          }}
        />
        <Text style={titleStyle}>Allergies</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.allergies}
          onChangeText={(allergies) => {
            item.allergies = allergies;
          }}
        />
        <Text style={titleStyle}>Chronic Illnesses</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.chronicIllnesses}
          onChangeText={(chronicIllnesses) => {
            item.chronicIllnesses = chronicIllnesses;
          }}
        />
      </ScrollView>
    );
  };

  render() {
    return this.state.loading ? (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    ) : (
      <SafeAreaView style={styles.container}>
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
                Civilians
              </Text>
              <Text style={[styles.medium15, { color: "#294C60" }]}>
                {this.state.mission.civilians.map((civ) => civ.name).join(", ")}
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
                Civilian Information
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.updateCivilianInformation();
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
          isVisible={this.state.civilianInformationModalOpen}
          avoidKeyboard
          scrollHorizontal
          propagateSwipe
          useNativeDriver
          onSwipeThreshold={200}
          onSwipeComplete={() =>
            this.setState({ civilianInformationModalOpen: false })
          }
          onBackdropPress={() =>
            this.setState({ civilianInformationModalOpen: false })
          }
          style={{ margin: 0 }}
        >
          <View style={[styles.bottomModalContainer, { height: "75%" }]}>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <BottomModalIndexIndicator
                total={this.state.mission.civilians.length}
                current={this.state.activeIndex}
              />
            </View>
            <Carousel
              ref={(c) => {
                this._carousel = c;
              }}
              loop
              data={this.state.mission.civilians}
              firstItem={this.state.activeIndex}
              renderItem={this.rendercivilianInformation}
              sliderWidth={Dimensions.get("window").width}
              itemWidth={Dimensions.get("window").width}
              onSnapToItem={(activeIndex) => this.setState({ activeIndex })}
            />
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

export default MissionScreen;
