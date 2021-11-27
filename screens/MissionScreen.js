import React, { Component } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
} from "react-native";
import styles from "../utils/Styles";
import BluetoothIcon from "../assets/svg/bluetooth.svg";
import Modal from "react-native-modal";
import Carousel from "react-native-snap-carousel";
import BottomModalIndexIndicator from "../components/BottomModalIndexIndicator";
import Chip from "../components/Chip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
} from "react-native-chart-kit";

class MissionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      civilianInformationModalOpen: false,
      connectedDevices: [],
      mission: {},
      activeIndex: 0,
      reading: false,
      ecgReading: [],
    };
  }

  async componentDidMount() {
    let mission = await this.getMissionInformation();
    await this.getPairedDevices();
    this.setState({ mission });

    this.setState({ loading: false });
  }

  async getPairedDevices() {
    let available = await RNBluetoothClassic.isBluetoothAvailable();
    let enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (available && enabled) {
      let connectedDevices = await RNBluetoothClassic.getBondedDevices();

      for (let device of connectedDevices) {
        let connected = await device.isConnected();
        let cacheDevice = await AsyncStorage.getItem(`@${device.id}`).catch();
        if (cacheDevice) {
          cacheDevice = JSON.parse(cacheDevice);
          Object.assign(device, {
            addedDate: cacheDevice.addedDate,
            status: "No readings yet",
            action: connected ? "Read" : "Connect",
          });
        }
      }
      this.setState({ connectedDevices });
    }
  }

  async getMissionInformation() {
    let civilian1 = {
      id: 1,
      name: "John Doe",
      sex: "Man",
      dob: "1/1/1970",
      address: "Address",
      emergencyContact: "+961 1 234 567",
      bloodType: "A+",
      height: "185cm",
      weight: "85kg",
      allergies: "Allergy A, Allergy B",
      abnormalities: [
        {
          id: "1dAVb",
          name: "1st Degree AV Block",
          status: false,
        },
        {
          id: "RBBB",
          name: "Right Bundle Branch Block",
          status: false,
        },
        {
          id: "LBBB",
          name: "Left Bundle Branch Block",
          status: false,
        },
        {
          id: "SB",
          name: "Sinus Bradycardia",
          status: false,
        },
        {
          id: "AF",
          name: "Atrial Fibrillation",
          status: false,
        },
        {
          id: "ST",
          name: "Sinus Tachycardia",
          status: false,
        },
      ],
    };
    let civilian2 = {
      id: 1,
      name: "Jane Doe",
      sex: "Woman",
      dob: "1/1/1970",
      address: "Address",
      emergencyContact: "+961 1 234 567",
      bloodType: "A+",
      height: "185cm",
      weight: "85kg",
      allergies: "Allergy A, Allergy B",
      abnormalities: [
        {
          id: "1dAVb",
          name: "1st Degree AV Block",
          status: false,
        },
        {
          id: "RBBB",
          name: "Right Bundle Branch Block",
          status: false,
        },
        {
          id: "LBBB",
          name: "Left Bundle Branch Block",
          status: false,
        },
        {
          id: "SB",
          name: "Sinus Bradycardia",
          status: false,
        },
        {
          id: "AF",
          name: "Atrial Fibrillation",
          status: false,
        },
        {
          id: "ST",
          name: "Sinus Tachycardia",
          status: false,
        },
      ],
    };
    let civilian3 = {
      id: 1,
      name: "John Doe",
      sex: "Non-Binary",
      dob: "1/1/1970",
      address: "Address",
      emergencyContact: "+961 1 234 567",
      bloodType: "A+",
      height: "185cm",
      weight: "85kg",
      allergies: "Allergy A, Allergy B",
      abnormalities: [
        {
          id: "1dAVb",
          name: "1st Degree AV Block",
          status: false,
        },
        {
          id: "RBBB",
          name: "Right Bundle Branch Block",
          status: false,
        },
        {
          id: "LBBB",
          name: "Left Bundle Branch Block",
          status: false,
        },
        {
          id: "SB",
          name: "Sinus Bradycardia",
          status: false,
        },
        {
          id: "AF",
          name: "Atrial Fibrillation",
          status: false,
        },
        {
          id: "ST",
          name: "Sinus Tachycardia",
          status: false,
        },
      ],
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

  async deviceAction(device) {
    let connectedDevices = this.state.connectedDevices;
    let ecgReading = this.state.ecgReading;

    if (device.action == "Connect") {
      try {
        await device.connect();
        device.action = "Read";
        this.setState({ connectedDevices });
      } catch (e) {
        console.log("Failed");
      }
    } else {
      if (this.state.reading == false) {
        device.action = "Stop";
        this.setState({ connectedDevices, reading: true });
        await device.write("start");
        while (this.state.reading == true) {
          let reading = await device.read();
          reading =
            reading && parseInt(reading.substring(0, reading.length - 1));
          if (ecgReading.length == 20) {
            ecgReading.shift();
          }
          ecgReading.push(reading);
          this.setState({ ecgReading });
        }
      } else if (this.state.reading == true) {
        device.action = "Read";
        this.setState({ connectedDevices, reading: false });
        console.log("Stop reading from", device.name);

        await device.write("stop");
      }
    }
  }

  updateCivilianInformation() {
    this.setState({ civilianInformationModalOpen: true });
  }

  openMaps() {
    console.log("Open Maps");
  }

  renderCivilianInformation = ({ item }) => {
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
        <Text style={titleStyle}>Sex</Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Chip
            pressed={item.sex == "Man"}
            style={{ width: "30%", margin: 5 }}
            chipText="Man"
            onPress={() => {
              item.sex = "Man";
              let mission = this.state.mission;
              this.setState({ mission });
            }}
          />
          <Chip
            pressed={item.sex == "Woman"}
            style={{ width: "30%", margin: 5 }}
            chipText="Woman"
            onPress={() => {
              item.sex = "Woman";
              let mission = this.state.mission;
              this.setState({ mission });
            }}
          />
          <Chip
            pressed={item.sex == "Non-Binary"}
            style={{ width: "30%", margin: 5 }}
            chipText="Non-Binary"
            onPress={() => {
              item.sex = "Non-Binary";
              let mission = this.state.mission;
              this.setState({ mission });
            }}
          />
        </View>
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
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {item.abnormalities.map((abn, abnIndex) => (
            <Chip
              key={abnIndex}
              pressed={abn.status}
              style={{ width: "45%", margin: 5 }}
              chipText={abn.name}
              onPress={() => {
                abn.status = !abn.status;
                let mission = this.state.mission;
                this.setState({ mission });
              }}
            />
          ))}
        </View>
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
          source={require("../assets/png/apollo_splash.png")}
          style={{
            height: "100%",
            flex: 1,
          }}
          imageStyle={{ opacity: 0.03 }}
          resizeMode={"contain"}
        >
          <ScrollView>
            <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
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
                  {this.state.mission.civilians
                    .map((civ) => civ.name)
                    .join(", ")}
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
                  style={[
                    styles.semibold25,
                    { color: "#550C18", marginEnd: 10 },
                  ]}
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
              <View style={{ marginBottom: 5 }}>
                {this.state.connectedDevices.map((device, deviceIndex) => (
                  <View
                    key={deviceIndex}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      // marginBottom: 10,
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
                      onPress={async () => await this.deviceAction(device)}
                      style={[styles.buttonContainer, { height: 40, flex: 1 }]}
                    >
                      <Text style={[styles.semibold13, { color: "#FFFFFF" }]}>
                        {device.action}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={{ marginBottom: 20 }}>
                {this.state.ecgReading.length != 0 && (
                  <View style={{ width: "100%" }}>
                    <Text style={styles.semibold20}>ECG Data</Text>
                    <LineChart
                      data={{
                        labels: [],
                        datasets: [
                          {
                            data: this.state.ecgReading,
                          },
                        ],
                      }}
                      width={Dimensions.get("window").width - 40}
                      height={220}
                      chartConfig={{
                        backgroundColor: "#550C18",
                        backgroundGradientFrom: "#550C18",
                        backgroundGradientTo: "#294C60",
                        decimalPlaces: 0,
                        color: (opacity = 1) =>
                          `rgba(255, 255, 255, ${opacity})`,
                        style: {
                          borderRadius: 10,
                        },
                      }}
                      withHorizontalLabels={false}
                      withVerticalLabels={false}
                      withHorizontalLines={false}
                      withVerticalLines={false}
                      withDots={false}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                    />
                  </View>
                )}
              </View>
              <Text style={[styles.semibold25, { color: "#550C18" }]}>
                Mission Infomation
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={[styles.semibold15, { color: "#550C18", flex: 3 }]}
                >
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
          </ScrollView>
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
              renderItem={this.renderCivilianInformation}
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
