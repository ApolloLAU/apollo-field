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
import base64 from 'react-native-base64';

class App extends Component {
  constructor(props) {
    super(props);
    this.manager = new BleManager();
    this.state = {
      scanning: false,
      connected: false,
      device: null,
      message: "",
      serviceUUIDs: "",
      characteristicUUID: ""
    };
  }

  startScanning() {
    console.log('SCANNING!')
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
    console.log(`CONNECTING Service UUIDs: ${connectedDevice.serviceUUIDs}`)
    this.setState({serviceUUIDs: connectedDevice.serviceUUIDs})
    connectedDevice.connect().then((device) => {
      this.setState({ connected: true });
      return device.discoverAllServicesAndCharacteristics(null)
    }).then((mydevice) => {
      return mydevice.services()
    }).then(async (services) => {
      console.log(`GOT THE SERVICES: ${services}`)
      // console.log(services)
      // console.log(services[0])
      const characteristics = []

      for (let i = 0; i < services.length; i++) {
        const s = services[i];
        // console.log(`Current service: ${s}`)
        // console.log(s)
        const c = await s.characteristics()
        // console.log(`GOT A C:`)
        // console.log(c)
        characteristics.push(c)
      }
      console.log('final characteristics:')
      console.log(characteristics)
      return characteristics.flat(5).find(c => c.isWritableWithoutResponse)
      // console.log(Object.keys(services));
      // console.log(services.solicitedServiceUUIDs);
      // console.log(services.manufacturerData);
      // console.log(services.serviceData);
    }).then((myChar) => {
      if (myChar) {
        console.log('got a characteristic to send to:')
        console.log(myChar)
        this.setState({characteristicUUID: myChar.uuid})

      }
    });
  }

  disconnect() {
    let device = this.state.device;
    device.cancelConnection().then(r => this.setState({ connected: false }));
  }

  sendInformation() {
    console.log("SENDING INFORMATION")
    console.log(this.state.serviceUUIDs[0])
    console.log(this.state.characteristicUUID)
    let device = this.state.device;
    device.writeCharacteristicWithResponseForService(
      this.state.serviceUUIDs[0],
      this.state.characteristicUUID,
        base64.encode("Hello!"),
      null
    ).then((c) => {
      console.log("DATA SENT! GETTING RESPONSE!")
      c.monitor((error, c) => {
        if (error) {
          console.log('got an error')
          console.log(error)
        } else {
          console.log('GOT DATA BITCHES!')
          console.log(base64.decode(c.value))
        }
      })
    });
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
