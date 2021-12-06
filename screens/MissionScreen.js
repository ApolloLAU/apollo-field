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
import { API, Mission, SensorData } from "../api/API";
import Carousel from "react-native-snap-carousel";
import BottomModalIndexIndicator from "../components/BottomModalIndexIndicator";
import Chip from "../components/Chip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import { LineChart } from "react-native-chart-kit";
import LoadingComponent from "../components/LoadingComponent";
import Header from "../components/Header";

class MissionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      civilianInformationModalOpen: false,
      connectedDevices: [],
      mission: null,
      patients: [],
      activeIndex: 0,
      missionSubscription: undefined,
      ecgSubscription: undefined,
      reading: false,
      ecgReading: [],
      sensorData: undefined, //todo: make sure you check for undefined before plotting anything. Using undefined so we can tell if we have data or not.
    };
  }

  // todo: the data points you need to plot are available at this.state.sensorData.getCleanECGVals() (no x-values, just y values)

  async componentDidMount() {
    let mission = await this.getMissionInformation();
    await this.getPairedDevices();
    this.setState({ mission });

    this.setState({ loading: false });
  }

  async componentWillUnmount() {
    super.componentWillUnmount();
    if (this.state.missionSubscription) {
      await this.state.missionSubscription.unsubscribe();
      this.setState({ missionSubscription: undefined });
    }
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
    const currentUser = await API.getLoggedInUser();
    if (currentUser) {
      return API.getWorkerForUser(currentUser)
        .then(async (worker) => {
          if (worker) {
            let q = Mission.getWorkerActiveMissionQuery(worker);
            let currentMission = await Mission.getWorkerActiveMission(worker);

            if (!this.state.missionSubscription) {
              let subscription = await q.subscribe();
              subscription.on("create", async (new_mission) => {
                if (this.state.mission === null) {
                  this.setState({ loading: true });
                  await this.fetchCurrentMission(new_mission);
                }
              });

              subscription.on("enter", async (new_mission) => {
                console.log("current status", this.state.mission);
                if (this.state.mission === null) {
                  this.setState({ loading: true });
                  await this.fetchCurrentMission(new_mission);
                }
              });

              subscription.on("leave", async (old_mission) => {
                if (old_mission.getStatus() === "complete") {
                  // mission finished
                  this.setState({ mission: null, patients: [] });
                }
              });

              this.setState({ missionSubscription: subscription });
            }

            if (!this.state.ecgSubscription) {
            }

            if (currentMission !== null) {
              // we have one now!! set it
              return currentMission;
            } else {
              // currently no mission.
              this.setState({ loading: false });
              return null;
            }
            // return Mission.getWorkerActiveMission(worker)
          } else {
            throw new Error("Worker does not exist");
          }
        })
        .then((mission) => {
          if (mission !== null) return this.fetchCurrentMission(mission);
          else return null;
        });
    }

    // this should never happen.
    return new Promise((resolve, reject) => {
      reject();
    });
  }

  async fetchCurrentMission(mission) {
    return mission.fetch().then(async (cMission) => {
      await Promise.all(cMission.getPatients().map((w) => w.fetch()));

      await this.updatePatientSensorInfo(cMission);

      this.setState({
        mission: cMission,
        patients: cMission.getPatients(),
        loading: false,
      });
      return cMission;
    });
  }

  // todo: when a new patient is set as current patient (scanned QR code) we need to make sure that the old ECGs
  //      are set to THAT patient. This will be needed when we don't know the actual patient at the start of a mission.
  //      at that point, this method will need to be called since it will update the sensor subscriptions to the
  //      new patient.
  async updatePatientSensorInfo(mission) {
    if (mission.getPatients().length > 0) {
      // note: this needs to be executed if we change patient during mission (read qr code or smth)
      const patient = mission.getPatients()[0];
      const sensorQuery = SensorData.getQueryForCurrentMission(
        mission,
        patient
      );

      const foundData = await sensorQuery.find(); // found data is an array of SensorData that already exists
      // one SensorData for each reading (start till stop).
      if (foundData.length > 0) {
        // we have previous ecgs, probably want to graph them?
        this.setState({ sensorData: foundData[foundData.length - 1] }); // sensorData can now be graphed
      }

      if (this.state.ecgSubscription) {
        // we already were subscribed to something.
        this.state.ecgSubscription.unsubscribe();
      }
      let sensorSubscription = await sensorQuery.subscribe();
      sensorSubscription.on("create", (obj) => {
        // a new ecg was created for this patient and saved to the db => plot that one instead
        // this is what will happen as soon as you call .save() for the first time.
        this.setState({ sensorData: obj });
      });

      sensorSubscription.on("enter", (obj) => {
        // a previous ecg was set to this patient (patient change)
        // only plot of this is the newest one.
        if (
          this.state.sensorData &&
          this.state.sensorData.createdAt > obj.createdAt
        ) {
          return; // already have a more recent one. do nothing
        }
        this.setState({ sensorData: obj });
      });

      sensorSubscription.on("update", (obj) => {
        // an existing ecg was updated (more values or a prediction occurred)
        // if it is the one we are working with, we need it.
        if (this.state.sensorData && this.state.sensorData.id === obj.id) {
          // same one. update our state with new values!
          this.setState({ sensorData: obj });
        }
      });

      this.setState({ ecgSubscription: sensorSubscription });
    }
  }

  async deviceAction(device) {
    let connectedDevices = this.state.connectedDevices;
    let ecgReading = this.state.ecgReading;

    if (device.action === "Connect") {
      try {
        await device.connect();
        device.action = "Read";
        this.setState({ connectedDevices });
      } catch (e) {
        console.log("Failed");
      }
    } else {
      if (this.state.reading === false) {
        let sensorData = new SensorData();
        sensorData.setMission(this.state.mission);
        sensorData.setPatient(this.state.patients[0]); // todo: this just needs to be the current patient
        this.setState({ sensorData });
        device.action = "Stop";
        this.setState({ connectedDevices, reading: true });
        await device.write("start");
        while (this.state.reading === true) {
          let reading = await device.read();
          reading =
            reading && parseInt(reading.substring(0, reading.length - 1));
          reading && ecgReading.push(reading);
          if (ecgReading.length >= 200) {
            console.log(ecgReading);
            sensorData.addRawECGValues(ecgReading);
            await sensorData.save();
            // ecgReading.shift();
            ecgReading = [];
          }
          this.setState({ ecgReading });
        }
      } else if (this.state.reading === true) {
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
          <Text style={civilianTitleStyle}>{item.getFormattedName()}</Text>
          <TouchableOpacity
            onPress={() => {
              item.save().then((t) =>
                this.setState({
                  mission,
                  civilianInformationModalOpen: false,
                })
              );
            }}
          >
            <Text style={civilianTitleStyle}>Save</Text>
          </TouchableOpacity>
        </View>
        <Text style={titleStyle}>Full Name</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getFormattedName()}
          onChangeText={(name) => {
            item.setFirstName(name); // todo: backend has separate first and last name fields. needs fixing
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
            pressed={item.getSex() === "Man"}
            style={{ width: "30%", margin: 5 }}
            chipText="Man"
            onPress={() => {
              item.setSex("Man");
              let mission = this.state.mission;
              this.setState({ mission });
            }}
          />
          <Chip
            pressed={item.getSex() === "Woman"}
            style={{ width: "30%", margin: 5 }}
            chipText="Woman"
            onPress={() => {
              item.setSex("Woman");
              let mission = this.state.mission;
              this.setState({ mission });
            }}
          />
          <Chip
            pressed={item.getSex() === "Non-Binary"}
            style={{ width: "30%", margin: 5 }}
            chipText="Non-Binary"
            onPress={() => {
              item.setSex("Non-Binary");
              let mission = this.state.mission;
              this.setState({ mission });
            }}
          />
        </View>
        <Text style={titleStyle}>Date Of Birth</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getDOB().toLocaleDateString()}
          onChangeText={(dob) => {
            item.setDOB(new Date(dob)); // todo: make sure dob is in a correct format
          }}
        />
        <Text style={titleStyle}>Address</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getHomeAddress()}
          onChangeText={(address) => {
            item.setHomeAddress(address);
          }}
        />
        <Text style={titleStyle}>Phone Number</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getCellNbr()}
          onChangeText={(cellNbr) => {
            item.setCellNbr(cellNbr);
          }}
        />
        <Text style={titleStyle}>Emergency Contact</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getEmergencyNbr()}
          onChangeText={(emergencyContact) => {
            item.setEmergencyNbr(emergencyContact);
          }}
        />
        <Text style={titleStyle}>Blood Type</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getBloodType()}
          onChangeText={(bloodType) => {
            item.setBloodType(bloodType);
          }}
        />
        <Text style={titleStyle}>Height</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getHeight().toString()}
          onChangeText={(height) => {
            item.setHeight(parseFloat(height));
          }}
        />
        <Text style={titleStyle}>Weight</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getWeight().toString()}
          onChangeText={(weight) => {
            item.setWeight(parseFloat(weight));
          }}
        />
        <Text style={titleStyle}>Allergies</Text>
        <TextInput
          style={textInputStyle}
          defaultValue={item.getAllergies()}
          onChangeText={(allergies) => {
            item.setAllergies(allergies);
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
            <Chip
                pressed={item.getPrevConditions()}
                style={{ width: "45%", margin: 5 }}
                chipText={"Yes"}
                onPress={() => {
                    item.setPrevConditions(true)
                }}
            />
            <Chip
                pressed={!item.getPrevConditions()}
                style={{ width: "45%", margin: 5 }}
                chipText={"No"}
                onPress={() => {
                    item.setPrevConditions(false)
                }}
            />
        </View>
      </ScrollView>
    );
  };

  // todo: idk if this is possible, but when only one patient, carousel shouldn't show the single dot cuz it doesn't make sense.
  // todo: previous heart conditions should now be a single checkbox
  //  DOB should be date selector, or at least make sure date is formatted correctly
  //  blood type can be dropdown
  //  height/weight should be a number
  //  also clicking save currently only uploads athe CURRENT patient to the backend. we need to call .save() (which is async btw) on all patients.
  render() {
    if (this.state.loading) {
      return <LoadingComponent />;
    } else if (this.state.mission === null) {
      return (
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
    } else {
      // todo: depending on location and initial diagnosis text size, the entire screen may not fit and will need to be scrollable
      return (
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
            <Header />
            <ScrollView>
              <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                <Text
                  style={[
                    styles.bold30,
                    { color: "#550C18", marginBottom: 15 },
                  ]}
                >
                  Mission {this.state.mission.id}
                </Text>

                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.semibold25, { color: "#550C18" }]}>
                    Civilians
                  </Text>
                  <Text style={[styles.medium15, { color: "#294C60" }]}>
                    {this.state.mission.formatPatientNames()}
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
                      {this.state.mission.getFormattedLocation()}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.semibold25, { color: "#550C18" }]}>
                    Initial Diagnosis
                  </Text>
                  <Text style={[styles.medium15, { color: "#294C60" }]}>
                    {this.state.mission.getInitialDesc()}
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
                        style={[
                          styles.semibold13,
                          { color: "#550C18", flex: 2 },
                        ]}
                      >
                        {device.status}
                      </Text>
                      <TouchableOpacity
                        onPress={async () => await this.deviceAction(device)}
                        style={[
                          styles.buttonContainer,
                          { height: 40, flex: 1 },
                        ]}
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
                          paddingRight: 0,
                          borderRadius: 10,
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
                  total={this.state.patients.length}
                  current={this.state.activeIndex}
                />
              </View>
              <Carousel
                ref={(c) => {
                  this._carousel = c;
                }}
                loop
                data={this.state.patients}
                firstItem={this.state.activeIndex}
                renderItem={this.renderCivilianInformation}
                sliderWidth={Dimensions.get("window").width}
                itemWidth={Dimensions.get("window").width}
                onSnapToItem={(activeIndex) => this.setState({ activeIndex })}
              />
            </View>
          </Modal>
        </View>
      );
    }
  }
}

export default MissionScreen;
