import { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { createStructuredSelector } from "reselect";
import { makeSelectDuration } from "modules/LiveEvent/redux/selectors";
import Flex from "components/Flex";
import convertMS from "utils/convertMS";

class Timer extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.duration !== this.props.duration) {
      return true;
    }
    return false;
  }
  render() {
    const { className, duration, onFinish } = this.props;
    if (duration === -1) {
      return null;
    }
    const timeObj = convertMS(duration);
    if (Object.values(timeObj).every((val) => val === 0)) {
      onFinish();
    }
    const { days, hours, minutes, seconds } = timeObj;
    return (
      <Flex className={className}>
        <div className="timer-container">
          <span className="title">Days</span>
          <div className="days">{days}</div>
        </div>
        <span className="seperator">:</span>
        <div className="timer-container">
          <span className="title">Hours</span>
          <div className="hours">{hours}</div>
        </div>
        <span className="seperator">:</span>
        <div className="timer-container">
          <span className="title">Minutes</span>
          <div className="minutes">{minutes}</div>
        </div>
        <span className="seperator">:</span>
        <div className="timer-container">
          <span className="title">Seconds</span>
          <div className="seconds">{seconds}</div>
        </div>
      </Flex>
    );
  }
}

const StyledTimer = styled(Timer)`
  .timer-container div {
    border: 1px solid #eee;
    padding: 5px;
    border-radius: 2px;
    font-size: 1.3rem;
    text-align: center;
  }
  .timer-container .title {
    font-weight: bold;
    font-size: 0.8rem;
  }
  .seperator {
    margin: 0 5px;
    display: flex;
    align-items: center;
    padding-top: 0.8rem;
  }
`;

const mapStateToProps = createStructuredSelector({
  duration: makeSelectDuration(),
});

export default connect(mapStateToProps)(StyledTimer);
