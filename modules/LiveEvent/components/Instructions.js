import styled from "styled-components";
import Button from "components/Button";

const milliSecondsToMinutes = (duration) => duration / 60 / 1000;

const Instructions = ({ className, event, startHandler }) => {
  const { startTimeStamp, endTimeStamp, duration, type, eventId } = event;
  return (
    <main className={className}>
      <div className="instructions">
        <h3>Following points to be noted:</h3>
        <ul>
          <li>
            You can start the event as soon as you click the button "Start"
            below.
          </li>
          <li>
            This event started at <strong>{startTimeStamp}</strong>
          </li>
          <li>
            This event will end at <strong>{endTimeStamp}</strong>
          </li>

          <li>
            This event will last for a duration of{" "}
            {milliSecondsToMinutes(duration)} minutes
          </li>
          <li>
            <strong>
              However, the event will terminate at {endTimeStamp} even if you
              have some minutes left!
            </strong>
          </li>

          <li>Best of luck!</li>
        </ul>
        <Button onClick={startHandler}>Start</Button>
      </div>
    </main>
  );
};

export default styled(Instructions)`
  font-size: 1.3rem;

  .instructions {
    background-color: #eee;
    padding: 1rem 2rem;
    margin: 1rem 0;
    li {
      margin: 1rem;
    }
    button {
      display: block;
      margin: auto;
    }
  }
`;
