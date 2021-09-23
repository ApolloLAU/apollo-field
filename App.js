import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Button,
} from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import { ScrollView } from "react-native-gesture-handler";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discovering: false,
      pairing: false,
      connecting: false,
      devices: [],
      message: "No Message",
      reading: false,
    };
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

  async componentDidUpdate() {
    // this.read();
  }

  openSettings() {
    RNBluetoothClassic.openBluetoothSettings();
  }

  async startScanning() {
    let granted = await this.requestAccessFineLocationPermission();
    // console.log("granted", granted);
    if (!granted) {
      throw new Error(`Access fine location was not granted`);
    }

    this.setState({ discovering: true });

    let devices = [];
    // let scanResults = await RNBluetoothClassic.startDiscovery();

    // for (let device of scanResults) {
    //   if (device.name === "HC-05") {
    //     devices.push(device);
    //   }
    // }

    let pairedDevices = await RNBluetoothClassic.getBondedDevices();
    for (let device of pairedDevices) {
      devices.push(device);
    }
    // this.setState({ devices });

    let connectedDevices = await RNBluetoothClassic.getConnectedDevices();
    for (let device of connectedDevices) {
      devices.push(device);
    }

    this.setState({ devices, discovering: false });
  }

  async pair() {
    this.setState({ pairing: true });
    await RNBluetoothClassic.pairDevice(this.state.devices[0].address);
    this.setState({ pairing: false });
  }

  async unpair() {
    this.setState({ unpairing: true });
    await RNBluetoothClassic.unpairDevice(this.state.devices[0].address);
    this.setState({ unpairing: false });
  }

  async connect() {
    this.setState({ connecting: true });
    let connection = await this.state.devices[0].connect({
      DEVICE_CHARSET: Platform.OS === "ios" ? 1536 : "utf-8",
    });

    console.log("Connected :", connection);
    this.setState({ connecting: false });
  }

  async read() {
    this.setState({ reading: true });
    let message = await this.state.devices[0].read();
    if (message != null) {
      this.setState({ message });
    }
    this.setState({ reading: false });
    setTimeout(await this.read(), 500);
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Open Settings"
          onPress={() => this.openSettings()}
        ></Button>
        <Button
          title={!this.state.discovering ? "Start Scanning" : "Scanning..."}
          onPress={async () => await this.startScanning()}
        ></Button>
        <Button
          title={this.state.pairing ? "Pairing..." : "Pair"}
          onPress={async () => await this.pair()}
        ></Button>
        <Button
          title={this.state.unpairing ? "Connecting..." : "Connect"}
          onPress={async () => await this.connect()}
        ></Button>
        <Button
          title={this.state.reading ? "Reading..." : "Read"}
          onPress={async () => await this.read()}
        ></Button>
        <Text>
          {this.state.devices.length != 0
            ? "Devices Found:"
            : "No devices Found"}
        </Text>
        <ScrollView>
          {this.state.devices.map((device, deviceIndex) => (
            <View key={deviceIndex}>
              <Text>{device.name}</Text>
            </View>
          ))}
        </ScrollView>
        <Text>{this.state.message}</Text>
      </View>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
