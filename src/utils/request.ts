import axios from 'axios';

const BASE_URL = process.env.FE_CLI_BASE_URL ? process.env.FE_CLI_BASE_URL : 'http://112.74.201.142:7003';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use(
  (response) => {
    console.log('response', response);
    if (response.status === 200) {
      return response.data;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default request;
