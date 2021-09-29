import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  TextInput,
} from "react-native";
import { BleManager } from "react-native-ble-plx";

class App extends Component {
  constructor(props) {
    super(props);
    this.manager = new BleManager();
    this.state = {
      scanning: false,
      connected: false,
      device: null,
      message: "",
    };
  }

  startScanning() {
    let scanning = this.state.scanning;
    if (scanning) {
      this.manager.stopDeviceScan();
      this.setState({ scanning: false });
    } else {
      this.setState({ scanning: true });
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          return;
        }
        if (device.name == "HMSoft") {
          this.setState({ device });
          this.manager.stopDeviceScan();
        }
      });
    }
  }

  connect() {
    this.setState({ connected: false });
    let connectedDevice = this.state.device;

    connectedDevice.connect().then((device) => {
      this.setState({ connected: true });
      device.discoverAllServicesAndCharacteristics(null).then((services) => {
        console.log(Object.keys(services));
        console.log(services.solicitedServiceUUIDs);
        console.log(services.manufacturerData);
        console.log(services.serviceData);
      });
    });
  }

  disconnect() {
    let device = this.state.device;
    device.cancelConnection();
    this.setState({ connected: false });
  }

  sendInformation() {
    let device = this.state.device;
    device.writeCharacteristicWithoutResponseForService(
      0xffe0,
      0xffe1,
      "A0B0C0",
      null
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          title={!this.state.scanning ? "Start Scanning" : "Stop Scanning"}
          onPress={() => this.startScanning()}
        ></Button>
        {this.state.device && (
          <View style={{ marginVertical: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ marginEnd: 10 }}>{this.state.device.name}</Text>
              <Button
                title={this.state.connected ? "Disonnect" : "Connect"}
                onPress={() => {
                  this.state.connected ? this.disconnect() : this.connect();
                }}
              ></Button>
            </View>
            {this.state.connected && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  style={styles.textInputStyle}
                  onChangeText={(message) => {
                    this.setState({ message });
                  }}
                />
                <Button title="Send" onPress={() => this.sendInformation()} />
              </View>
            )}
          </View>
        )}
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
  textInputStyle: {
    height: 40,
    width: "50%",
    backgroundColor: "#F2F2F2",
    elevation: 5,
    borderRadius: 10,
    paddingLeft: 10,
    marginEnd: 20,
  },
});
