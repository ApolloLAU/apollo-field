import React, { Component } from "react";
import { View } from "react-native";
import styles from "../utils/Styles";

class BottomModalIndexIndicator extends Component {
  renderCircles() {
    let total = this.props.total;
    let current = this.props.current;

    let renderComponent = [];
    for (let i = 0; i < total; i++) {
      i == current
        ? renderComponent.push(<View key={i} style={styles.circleSelected} />)
        : renderComponent.push(<View key={i} style={styles.circle} />);
    }

    return <View style={{ flexDirection: "row" }}>{renderComponent}</View>;
  }

  render() {
    return this.renderCircles();
  }
}

export default BottomModalIndexIndicator;
