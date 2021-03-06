import { takeEvery, call, put } from "redux-saga/effects";
import cogoToast from "cogo-toast";
import * as actionTypes from "./constants";
import { fetchUserRequest } from "modules/Auth/redux/actions";
import config from "config/env";
import request from "lib/request";

function* participateRequestSaga({ payload }) {
  try {
    const requestUrl = `${config.apiUrl}/event/participate`;
    const { title, token } = payload;
    yield call(request, requestUrl, {
      method: "POST",
      body: JSON.stringify({
        participationToken: token,
      }),
    });
    cogoToast.success(
      `You have successfully registered for the event ${title}`
    );
    yield put(fetchUserRequest());
  } catch (error) {
    cogoToast.error(error.message);
  }
}

export default [
  takeEvery(actionTypes.PARTICIPATE_REQUEST, participateRequestSaga),
];
