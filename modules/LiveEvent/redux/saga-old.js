import io from "socket.io-client";
import cogoToast from "cogo-toast";
import {
  take,
  call,
  put,
  cancelled,
  race,
  fork,
  delay,
  select,
  takeLatest,
} from "redux-saga/effects";
import { eventChannel } from "redux-saga";

import { START_EVENT, END_EVENT, TIMER_SYNC, TIMER_OVER } from "./constants";
import {
  endEvent,
  socketConnected,
  socketDisconnected,
  timerSync,
  contentfulEventData,
  eventDataSubmitSuccessful,
  eventDataSubmitError,
} from "./actions";
import { makeSelectNamespace } from "./selectors";
import config from "config/env";
import request from "lib/request";

let socket;

function buildSocketConnectionString(namespace) {
  let connectionString = config.socketServerUrl;
  if (namespace) {
    connectionString += `/${namespace}`;
  }
  return connectionString;
}

function connect(namespace) {
  const connectionString = buildSocketConnectionString(namespace);
  if (!socket) {
    socket = io(connectionString);
  }
  return new Promise((resolve) => {
    socket.on("connect", () => {
      resolve(socket);
    });
  });
}

function disconnect(namespace) {
  const connectionString = buildSocketConnectionString(namespace);
  if (!socket) {
    socket = io(connectionString);
  }
  return new Promise((resolve) => {
    socket.on("disconnect", () => {
      resolve(socket);
    });
  });
}

function reconnect(namespace) {
  const connectionString = buildSocketConnectionString(namespace);
  if (!socket) {
    socket = io(connectionString);
  }
  return new Promise((resolve) => {
    socket.on("reconnect", () => {
      resolve(socket);
    });
  });
}

function* listenDisconnectSaga() {
  const namespace = yield select(makeSelectNamespace());
  while (true) {
    yield call(disconnect, namespace);
    yield put(socketDisconnected());
  }
}

function* listenConnectSaga() {
  const namespace = yield select(makeSelectNamespace());
  while (true) {
    yield call(reconnect, namespace);
    yield put(socketConnected());
  }
}

const createSocketChannel = (socket) =>
  eventChannel((emit) => {
    const handleTimerSync = (data) => {
      emit(data);
    };
    const handleTimerOver = () => {
      emit(TIMER_OVER);
    };
    socket.on(TIMER_SYNC, handleTimerSync);
    socket.on(TIMER_OVER, handleTimerOver);
    return () => {
      socket.off(TIMER_SYNC, handleTimerSync);
    };
  });

function* listenServerSaga() {
  try {
    const namespace = yield select(makeSelectNamespace());
    const { timeout, socket } = yield race({
      socket: call(connect, namespace),
      timeout: delay(2000),
    });
    if (timeout) {
      yield put(socketDisconnected());
      throw new Error("Timeout");
    }
    const socketChannel = yield call(createSocketChannel, socket);
    yield fork(listenConnectSaga);
    yield fork(listenDisconnectSaga);
    yield put(socketConnected());
    while (true) {
      const payload = yield take(socketChannel);
      if (payload === TIMER_OVER) {
        console.log(payload);
        break;
      } else {
        yield put(timerSync(payload));
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    console.log("Finally");
    if (yield cancelled()) {
      console.log("Closed");
      socket.disconnect(true);
    }
  }
}

function* liveEventFlow() {
  while (true) {
    const {
      payload: { eventId, type },
    } = yield take(START_EVENT);
    try {
      const requestUrl = `${config.apiUrl}/event/start/${eventId}`;
      const data = yield call(request, requestUrl, {
        method: "POST",
        body: JSON.stringify({
          timestamp: new Date(),
        }),
      });
      if (type === "Contentful") {
        const { content } = data;
        // store the content in store
        yield put(contentfulEventData(content));
      }

      yield race({
        task: call(listenServerSaga),
        cancel: take(END_EVENT),
      });
    } catch (error) {
      cogoToast.error(error.message);
      console.log("Failed to start the event");
    }
  }
}

function* endEventSaga({ payload }) {
  try {
    const { type, replies, eventId } = payload;
    const requestUrl = `${config.apiUrl}/event/end/${eventId}`;
    yield call(request, requestUrl, {
      method: "POST",
      body: JSON.stringify({ replies }),
    });
    if (type === "Contentful") {
      cogoToast.success("Successfully submitted your answers!");
    }
    cogoToast.success("Successfully exited the event!");
    yield put(eventDataSubmitSuccessful());
  } catch (error) {
    cogoToast.error("Some Error occured while exiting the event");
    yield put(eventDataSubmitError());
  }
}

export default [liveEventFlow(), takeLatest(END_EVENT, endEventSaga)];
