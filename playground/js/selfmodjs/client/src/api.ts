import axios, {AxiosResponse} from "axios";
import {getInitialState, TAction, TActionDbGet, TState} from "./types";

let axiosConfig = {
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    "Access-Control-Allow-Origin": "*",
  }
};

export function createApi(dispatch) {
  return {
    get(type, url) {
      return axios.get(url, axiosConfig)
        .then((response: AxiosResponse<TState>) => {
          const ret: TActionDbGet = {
            type,
            response: response.data,
            success: true,
            error: ""
          }
          dispatch(ret)
        })
        .catch((error: any) => {
          const ret: TActionDbGet = {
            type,
            response: getInitialState(),
            success: false,
            error
          }
          dispatch(ret)
        })
    },
    post(type, url, data) {
      return axios.post(url, data, axiosConfig)
        .then(response => {
          dispatch({type, response, success: true})
        })
        .catch(error => {
          dispatch({type, error, success: false})
        })
    }
  }
}
