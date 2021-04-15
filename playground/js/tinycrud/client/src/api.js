import axios from "axios";

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
        .then(response => {
          dispatch({type, response: response.data, success: true})
        })
        .catch(error => {
          dispatch({type, error, success: false})
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
